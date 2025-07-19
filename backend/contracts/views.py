from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Avg
from django.http import HttpResponse
from django.db import models, transaction
from .utils.utils import generate_html_for_contract
from contracts.signals import send_notification_email
from asgiref.sync import async_to_sync
from .models import Contract, Review, Signature
from .serializers import AssignReviewSerializer, ContractSerializer, ReviewSerializer, SignatureSerializer
from .permissions import ContractPermissions
from .utils.pdf_generator import generate_pdf
from .utils.doc_generator import generate_docx
from .utils.gpt_integration import generate_contract_html, analyze_contract
from django.template.loader import render_to_string
from barcode import Code128
from barcode.writer import SVGWriter
from io import BytesIO
import csv
from datetime import datetime
from django.contrib.auth import get_user_model
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives.asymmetric.padding import PSS, MGF1
from cryptography.hazmat.backends import default_backend
from cryptography.exceptions import InvalidSignature
import hashlib
import base64
import json
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from io import BytesIO
from rest_framework.permissions import BasePermission
import qrcode
from rest_framework.views import APIView
from django.template import Template, Context
import logging

User = get_user_model()
logger = logging.getLogger(__name__)

def sort_dict_recursive(data):
    if isinstance(data, dict):
        return {k: sort_dict_recursive(v) for k, v in sorted(data.items())}
    return data

class ContractCreateView(APIView):
    permission_classes = [ContractPermissions]
    
    def get(self, request):
        try:
            if request.user.role and request.user.role.name == 'Lawyer':
                # Fetch contracts assigned to the lawyer via Review
                reviews = Review.objects.filter(lawyer=request.user).select_related('contract')
                contracts = [review.contract for review in reviews]
                logger.info(f"Retrieved {len(contracts)} assigned contracts for lawyer {request.user.id}")
            else:
                # Fetch contracts where the user is the client
                contracts = Contract.objects.filter(client=request.user)
                logger.info(f"Retrieved {len(contracts)} contracts for client {request.user.id}")
            
            serializer = ContractSerializer(contracts, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error retrieving contracts for user {request.user.id}: {str(e)}")
            return Response({'detail': f'No contracts found: {str(e)}'}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        data = request.data.copy()
        if data.get('contract_type') == 'NDA':
            nda_default_data = {
                "effective_date": "",
                "disclosing_party": "",
                "disclosing_party_address": "",
                "receiving_party": "",
                "receiving_party_address": "",
                "purpose": "",
                "confidential_info": "",
                "term": "",
                "governing_law": "",
                "signature_date": ""
            }
            data['data'] = {**nda_default_data, **data.get('data', {})}
        
        serializer = ContractSerializer(data=data)
        if serializer.is_valid():
            contract = serializer.save(client=request.user, status='DRAFT')
            template_name = 'nda.html' if contract.contract_type == 'NDA' else 'contract_template.html'
            try:
                context = {
                    'contract_type': contract.contract_type,
                    'data_items': contract.data.items(),
                    'data': contract.data,
                    'created_at': contract.created_at,
                    'signatures': contract.signatures.all(),
                    'signatures_block': ''
                }
                contract.text_version = render_to_string(template_name, context)
                contract.full_text = contract.text_version
                contract.save()
                logger.info(f"Contract {contract.id} created and rendered with template {template_name}")
            except Exception as e:
                logger.error(f"Error rendering template {template_name}: {str(e)}")
                return Response({
                    'error': f'Failed to render contract template: {str(e)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ContractAssignLawyerView(APIView):
    permission_classes = [ContractPermissions]
    
    def post(self, request, id):
        try:
            contract = Contract.objects.get(id=id)
            # Check if the requesting user is the client of the contract
            if request.user != contract.client:
                return Response({'error': 'Only the contract client can assign a lawyer'}, status=status.HTTP_403_FORBIDDEN)
            
            lawyer_id = request.data.get('lawyer_id')
            if not lawyer_id:
                return Response({'error': 'lawyer_id is required'}, status=status.HTTP_400_BAD_REQUEST)
                
            lawyer = User.objects.get(id=lawyer_id, role__name='Lawyer')
            review = Review.objects.create(
                contract=contract,
                lawyer=lawyer,
                status='PENDING',
                review_notes='Assigned by client'
            )
            
            contract.status = 'UNDER_REVIEW'
            contract.needs_review = True
            contract.save()
            
            # Send notification to lawyer
            send_notification_email.delay(
                lawyer.email,
                'New Contract Assigned for Review',
                f'You have been assigned to review contract {contract.id} by the client.'
            )
            
            return Response(AssignReviewSerializer(review).data, status=status.HTTP_201_CREATED)
        except Contract.DoesNotExist:
            return Response({'error': 'Contract not found'}, status=status.HTTP_404_NOT_FOUND)
        except User.DoesNotExist:
            return Response({'error': 'Lawyer not found'}, status=status.HTTP_404_NOT_FOUND)

class ContractDetailView(APIView):
    permission_classes = [ContractPermissions]
    
    def get(self, request, id):
        try:
            contract = Contract.objects.get(id=id)
            serializer = ContractSerializer(contract)
            return Response(serializer.data)
        except Contract.DoesNotExist:
            return Response({'error': 'Contract not found'}, status=status.HTTP_404_NOT_FOUND)

class ContractGenerateView(APIView):
    permission_classes = [ContractPermissions]
    
    def post(self, request, id):
        try:
            contract = Contract.objects.get(id=id)
            template_name = 'nda.html' if contract.contract_type == 'NDA' else 'contract_template.html'
            
            try:
                context = {
                    'contract_type': contract.contract_type,
                    'data_items': contract.data.items(),
                    'data': contract.data,
                    'created_at': contract.created_at,
                    'signatures': contract.signatures.all(),
                    'signatures_block': ''
                }
                contract.text_version = render_to_string(template_name, context)
                contract.full_text = contract.text_version
                contract.status = 'DRAFT'
                contract.save()
                logger.info(f"Contract {contract.id} generated with template {template_name}")
            except Exception as e:
                logger.error(f"Error rendering template {template_name}: {str(e)}")
                return Response({
                    'error': f'Failed to render contract template: {str(e)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            return Response({
                'text_version': contract.text_version,
                'full_text': contract.full_text,
                'ai_processing_used': False
            }, status=status.HTTP_200_OK)
            
        except Contract.DoesNotExist:
            return Response({'error': 'Contract not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Unexpected error in contract generation: {str(e)}", exc_info=True)
            return Response({
                'error': f'Failed to generate contract: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ContractEnhanceView(APIView):
    permission_classes = [ContractPermissions]
    
    def post(self, request, id):
        try:
            enhancement_type = request.data.get('enhancement_type', 'enhance')
            if enhancement_type not in ['enhance', 'correct', 'translate']:
                return Response({'error': 'Invalid enhancement type. Must be "enhance", "correct", or "translate"'}, 
                                status=status.HTTP_400_BAD_REQUEST)
            
            contract = Contract.objects.get(id=id)
            if not contract.full_text:
                return Response({'error': 'Contract has no full text to enhance'}, 
                                status=status.HTTP_400_BAD_REQUEST)
            
            if enhancement_type == 'translate':
                prompt_instruction = "Translate the HTML content to Arabic while preserving HTML structure, all tags, and including a {{ signatures_block }} placeholder at the end of the body."
            elif enhancement_type == 'correct':
                prompt_instruction = "Correct any grammatical, spelling, or formatting errors in the HTML content while preserving HTML structure and including a {{ signatures_block }} placeholder at the end of the body."
            else:  # enhance
                prompt_instruction = (
                    f"Enhance and redesign the HTML content for a legal contract of type '{contract.contract_type}'. "
                    "Apply a modern and professional UI layout that visually fits this specific contract type. "
                    "Reorganize the structure with appropriate sections, spacing, headings, and visual hierarchy according to the type (e.g., NDA, Employment, Service Agreement, etc). "
                    "Use elegant formatting, clean design, and smart HTML/CSS practices. "
                    "Do not alter the legal meaning. Do not add or remove content. "
                    "Include a {{ signatures_block }} placeholder at the end of the body for signature information. "
                    "Return only the full valid HTML document starting with <!DOCTYPE html> and ending with </html>, without any explanations or comments."
                )
            
            try:
                enhanced_html = async_to_sync(generate_html_for_contract)(
                    contract.full_text,
                    contract.data,
                    additional_instruction=prompt_instruction
                )
                logger.info(f"AI {enhancement_type} processing completed successfully for contract {contract.id}")
                contract.text_version = enhanced_html
            except ValueError as ve:
                logger.error(f"AI {enhancement_type} processing failed: {str(ve)}")
                contract.save()
                return Response({'error': f'AI processing failed: {str(ve)}'}, 
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            except Exception as e:
                logger.error(f"Unexpected error in AI {enhancement_type} processing: {str(e)}", exc_info=True)
                contract.save()
                return Response({'error': f'Unexpected error in AI processing: {str(e)}'}, 
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            try:
                html_cleaned = contract.text_version.strip().lower()
                if html_cleaned.startswith('<!doctype html') and html_cleaned.endswith('</html>'):
                    contract.full_text = contract.text_version
                    logger.info(f"AI HTML used directly for contract {contract.id}")
                else:
                    template_name = 'nda.html' if contract.contract_type == 'NDA' else 'contract_template.html'
                    context = {
                        'contract_type': contract.contract_type,
                        'data_items': contract.data.items(),
                        'data': contract.data,
                        'created_at': contract.created_at,
                        'signatures': contract.signatures.all(),
                        'gpt_html': contract.text_version,
                        'signatures_block': ''
                    }
                    contract.full_text = render_to_string(template_name, context)
                    logger.warning(f"Fallback template rendering used for contract {contract.id}")
                
                contract.save()
            except Exception as e:
                logger.error(f"Error saving enhanced contract: {str(e)}")
                return Response({
                    'error': f'Failed to save enhanced contract: {str(e)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            return Response({
                'text_version': contract.text_version,
                'full_text': contract.full_text,
                'enhancement_type': enhancement_type
            }, status=status.HTTP_200_OK)
        
        except Contract.DoesNotExist:
            return Response({'error': 'Contract not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Unexpected error in contract enhancement: {str(e)}", exc_info=True)
            return Response({
                'error': f'Failed to enhance contract: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ContractSignView(APIView):
    permission_classes = [ContractPermissions]
    
    def post(self, request, id):
        try:
            logger.debug(f"Starting contract signing process for contract ID: {id}, user: {request.user.id}")
            print(f"DEBUG: Initiating contract signing for ID: {id}, user: {request.user.id}")
            # Validate contract ID
            if not isinstance(id, int) and not str(id).isdigit():
                logger.error(f"Invalid contract ID format: {id}")
                print(f"ERROR: Invalid contract ID format: {id}")
                return Response(
                    {'error': 'Invalid contract ID format'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get contract
            try:
                logger.debug(f"Fetching contract with ID: {id}")
                print(f"DEBUG: Attempting to fetch contract ID: {id}")
                contract = Contract.objects.get(id=id)
                logger.debug(f"Successfully fetched contract: ID={contract.id}, type={contract.contract_type}, status={contract.status}")
                print(f"DEBUG: Contract fetched: ID={contract.id}, type={contract.contract_type}, status={contract.status}")
            except Contract.DoesNotExist:
                logger.error(f"Contract not found: {id}")
                print(f"ERROR: Contract not found: {id}")
                return Response(
                    {'error': 'Contract not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Check if contract is locked
            if contract.is_locked:
                logger.error(f"Attempt to sign locked contract: {id}")
                print(f"ERROR: Contract {id} is locked and cannot be signed")
                return Response(
                    {'error': 'Contract is locked and cannot be signed'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate required fields
            logger.debug(f"Validating required fields for contract {id}")
            print(f"DEBUG: Checking required fields for contract {id}")
            private_key_pem = request.data.get('private_key')
            signature_hash = request.data.get('signature_hash')
            public_key_pem = request.data.get('public_key')
            
            if not all([private_key_pem, signature_hash, public_key_pem]):
                missing_fields = [field for field, value in [
                    ('private_key', private_key_pem),
                    ('signature_hash', signature_hash),
                    ('public_key', public_key_pem)
                ] if not value]
                logger.error(f"Missing required fields for contract {id}: {missing_fields}")
                print(f"ERROR: Missing fields for contract {id}: {missing_fields}")
                return Response(
                    {'error': f'Missing required fields: {", ".join(missing_fields)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate field formats
            logger.debug(f"Validating field formats for contract {id}")
            print(f"DEBUG: Validating field formats for contract {id}")
            if not (private_key_pem.strip().startswith('-----BEGIN') and private_key_pem.strip().endswith('-----')):
                logger.error(f"Invalid private key PEM format for contract {id}")
                print(f"ERROR: Invalid private key PEM format for contract {id}")
                return Response(
                    {'error': 'Invalid private key PEM format'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not (public_key_pem.strip().startswith('-----BEGIN') and public_key_pem.strip().endswith('-----')):
                logger.error(f"Invalid public key PEM format for contract {id}")
                print(f"ERROR: Invalid public key PEM format for contract {id}")
                return Response(
                    {'error': 'Invalid public key PEM format'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                logger.debug(f"Decoding base64 signature for contract {id}")
                print(f"DEBUG: Attempting base64 decode for signature_hash in contract {id}")
                base64.b64decode(signature_hash)
                logger.debug(f"Successfully decoded base64 signature for contract {id}")
                print(f"DEBUG: Base64 signature decoded successfully for contract {id}")
            except Exception as e:
                logger.error(f"Invalid base64 signature for contract {id}: {str(e)}")
                print(f"ERROR: Invalid base64 signature for contract {id}: {str(e)}")
                return Response(
                    {'error': 'Invalid signature format (not valid base64)'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check for existing signature
            logger.debug(f"Checking for existing signatures for user {request.user.id} on contract {id}")
            print(f"DEBUG: Checking for existing signatures for user {request.user.id} on contract {id}")
            if contract.signatures.filter(user=request.user).exists():
                print(f"ERROR: User {request.user.id} already signed contract {id}")
                return Response(
                    {'error': 'You have already signed this contract'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create contract metadata
            try:
                logger.debug(f"Creating contract metadata for contract {id}")
                print(f"DEBUG: Generating contract metadata for contract {id}")
                contract_metadata = {
                    'id': contract.id,
                    'contract_type': contract.contract_type,
                    'status': contract.status,
                    'data': sort_dict_recursive(contract.data),
                    'needs_review': contract.needs_review,
                    'is_locked': contract.is_locked
                }
                contract_metadata_str = json.dumps(contract_metadata, separators=(',', ':'), sort_keys=True, ensure_ascii=False)
                logger.debug(f"Backend contract_metadata_str: {contract_metadata_str}")
                print(f"DEBUG: Contract metadata string: {contract_metadata_str}")
                contract_hash = hashlib.sha256(contract_metadata_str.encode('utf-8')).digest()
                logger.debug(f"Backend contract_hash: {contract_hash.hex()}")
                print(f"DEBUG: Contract hash: {contract_hash.hex()}")
            except (TypeError, ValueError) as e:
                logger.error(f"Error creating contract metadata for contract {id}: {str(e)}")
                print(f"ERROR: Failed to create contract metadata for {id}: {str(e)}")
                return Response(
                    {'error': 'Error processing contract data'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Cryptographic verification
            try:
                logger.debug(f"Attempting to load public key for contract {id}")
                print(f"DEBUG: Loading public key for contract {id}")
                public_key = serialization.load_pem_public_key(
                    public_key_pem.encode('utf-8'),
                    backend=default_backend()
                )
                logger.debug(f"Successfully loaded public key for contract {id}")
                print(f"DEBUG: Public key loaded for contract {id}")
                logger.debug(f"Verifying signature for contract {id} with signature_hash: {signature_hash}")
                print(f"DEBUG: Verifying signature for contract {id}, hash: {signature_hash}")
                public_key.verify(
                    base64.b64decode(signature_hash),
                    contract_hash,
                    padding.PSS(
                        mgf=padding.MGF1(hashes.SHA256()),
                        salt_length=32
                    ),
                    hashes.SHA256()
                )
                logger.debug(f"Signature verification successful for contract {id}")
                print(f"DEBUG: Signature verified successfully for contract {id}")
            except InvalidSignature:
                logger.error(f"Invalid signature for contract {id}")
                print(f"ERROR: Invalid signature for contract {id}")
                return Response(
                    {'error': 'Invalid signature - signature verification failed'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            except ValueError as e:
                logger.error(f"Signature verification error for contract {id}: {str(e)}")
                print(f"ERROR: Signature verification failed for {id}: {str(e)}")
                return Response(
                    {'error': 'Signature verification error'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            except Exception as e:
                logger.error(f"Unexpected signature verification error for contract {id}: {str(e)}")
                print(f"ERROR: Unexpected error in signature verification for {id}: {str(e)}")
                return Response(
                    {'error': 'Unexpected error during signature verification'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Save signature and update contract
            try:
                with transaction.atomic():
                    logger.debug(f"Creating signature object for contract {id}, user {request.user.id}")
                    print(f"DEBUG: Creating signature for contract {id}, user {request.user.id}")
                    signature = Signature.objects.create(
                        contract=contract,
                        user=request.user,
                        ip_address=request.META.get('REMOTE_ADDR'),
                        signature_hash=signature_hash,
                        public_key=public_key_pem
                    )
                    logger.debug(f"Signature created with ID: {signature.id}")
                    print(f"DEBUG: Signature created with ID: {signature.id}")
                    
                    # Generate QR code
                    try:
                        verify_url = request.build_absolute_uri(f'/verify/{signature.id}/')
                        logger.debug(f"Generated verify URL: {verify_url}")
                        print(f"DEBUG: Verify URL for signature {signature.id}: {verify_url}")
                        qr = qrcode.QRCode(version=1, box_size=10, border=4)
                        qr.add_data(verify_url)
                        qr.make(fit=True)
                        qr_img = qr.make_image(fill_color="black", back_color="white")
                        qr_buffer = BytesIO()
                        qr_img.save(qr_buffer, format="PNG")
                        qr_code_b64 = base64.b64encode(qr_buffer.getvalue()).decode('utf-8')
                        logger.debug(f"QR code generated for contract {id}")
                        print(f"DEBUG: QR code generated for contract {id}")
                    except Exception as e:
                        logger.error(f"Error generating QR code for contract {id}: {str(e)}")
                        print(f"ERROR: Failed to generate QR code for contract {id}: {str(e)}")
                        qr_code_b64 = None
                    
                    # Render signature block
                    logger.debug(f"Rendering signature block for contract {id}")
                    print(f"DEBUG: Rendering signature block for contract {id}")
                    signature_block = f"""
                        <div class="signature-entry">
                            <p>Signed by: {request.user.fullname}</p>
                            <p>Date: {signature.signed_at}</p>
                            {f'<img src="data:image/png;base64,{qr_code_b64}" alt="Signature QR Code" width="100" height="100">' if qr_code_b64 else ''}
                        </div>
                    """
                    logger.debug(f"Signature block rendered successfully for contract {id}")
                    print(f"DEBUG: Signature block rendered for contract {id}")
                    
                    # Update contract full_text
                    logger.debug(f"Updating contract full_text for contract {id}")
                    print(f"DEBUG: Updating contract full_text for contract {id}")
                    container_start = contract.full_text.find('<div class="container">')
                    container_end = contract.full_text.rfind('</div>', container_start)  # Closing </div> of container
                    if container_start == -1 or container_end == -1:
                        logger.error(f"Invalid HTML structure: no container div found in contract {id}")
                        print(f"ERROR: No container div found in contract {id}")
                        return Response(
                            {'error': 'Invalid HTML structure: no container div found'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )
                    
                    signature_section = '<div class="signature-section">'
                    if signature_section in contract.full_text:
                        print("DEBUG: Signature section found")
                        # Find section-content within signature-section
                        section_content_start = contract.full_text.find('<div class="section-content">', contract.full_text.find(signature_section))
                        section_content_end = contract.full_text.find('</div>', section_content_start) + 6
                        if section_content_start == -1 or section_content_end == -1:
                            logger.error(f"Invalid HTML structure in signature section for contract {id}")
                            print(f"ERROR: Invalid HTML structure in signature section for contract {id}")
                            return Response(
                                {'error': 'Invalid HTML structure: no section-content found in signature section'},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR
                            )
                        # Check if section-content contains any signature-entry
                        section_content = contract.full_text[section_content_start:section_content_end]
                        if '<div class="signature-entry">' in section_content:
                            # Append new signature-entry before closing </div> of signature-section
                            signature_section_end = contract.full_text.rfind('</div>', contract.full_text.find(signature_section))
                            contract.full_text = (
                                contract.full_text[:signature_section_end] +
                                signature_block +
                                contract.full_text[signature_section_end:]
                            )
                            logger.debug(f"Appended signature-entry to existing signature-section for contract {id}")
                            print(f"DEBUG: Appended signature-entry to existing signature-section for contract {id}")
                        else:
                            # Replace section-content with signature-entry for first signature
                            contract.full_text = (
                                contract.full_text[:section_content_start] +
                                signature_block +
                                contract.full_text[section_content_end:]
                            )
                            logger.debug(f"Replaced section-content with signature-entry for contract {id}")
                            print(f"DEBUG: Replaced section-content with signature-entry for contract {id}")
                    else:
                        # Add new signature-section before closing </div> of container
                        new_signature_section = f"""
                            <div class="signature-section">
                                <h3 class="section-title">التوقيع والتاريخ - <span class="english">SIGNATURE AND DATE</span></h3>
                                {signature_block}
                            </div>
                        """
                        contract.full_text = (
                            contract.full_text[:container_end] +
                            new_signature_section +
                            contract.full_text[container_end:]
                        )
                        logger.debug(f"Created new signature-section with signature-entry inside container for contract {id}")
                        print(f"DEBUG: Created new signature-section with signature-entry inside container for contract {id}")
                    
                    # Update contract status
                    try:
                        logger.debug(f"Updating contract status for contract {id}")
                        print(f"DEBUG: Updating status for contract {id}")
                        if request.user.groups.filter(name='Lawyer').exists():
                            contract.status = 'SIGNED_BY_LAWYER'
                            logger.debug(f"Contract {id} status set to SIGNED_BY_LAWYER")
                            print(f"DEBUG: Contract {id} status set to SIGNED_BY_LAWYER")
                        else:
                            contract.status = 'SIGNED_BY_CLIENT'
                            logger.debug(f"Contract {id} status set to SIGNED_BY_CLIENT")
                            print(f"DEBUG: Contract {id} status set to SIGNED_BY_CLIENT")
                        if contract.signatures.count() >= 2:
                            contract.status = 'COMPLETED'
                            contract.is_locked = True
                            logger.debug(f"Contract {id} status set to COMPLETED, locked: {contract.is_locked}")
                            print(f"DEBUG: Contract {id} status set to COMPLETED, locked: {contract.is_locked}")
                        contract.save()
                        logger.debug(f"Contract {id} saved with updated status: {contract.status}")
                        print(f"DEBUG: Contract {id} saved with status: {contract.status}")
                    except Exception as e:
                        logger.error(f"Error updating contract status for contract {id}: {str(e)}")
                        print(f"ERROR: Failed to update contract status for {id}: {str(e)}")
                        return Response(
                            {'error': 'Error updating contract status'}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )
                    
                    response_data = SignatureSerializer(signature).data
                    logger.info(f"Successfully signed contract {id} by user {request.user.id}")
                    print(f"INFO: Contract {id} successfully signed by user {request.user.id}")
                    return Response(response_data, status=status.HTTP_201_CREATED)
                    
            except Exception as e:
                logger.error(f"Database transaction error for contract {id}: {str(e)}")
                print(f"ERROR: Database transaction failed for contract {id}: {str(e)}")
                return Response(
                    {'error': 'Database transaction failed'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                
        except Exception as e:
            logger.error(f"Unexpected error in contract signing for contract {id}: {str(e)}")
            print(f"ERROR: Unexpected error during contract signing for {id}: {str(e)}")
            return Response(
                {'error': 'An unexpected error occurred'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ContractReviewView(APIView):
    permission_classes = [ContractPermissions]
    
    def post(self, request, id):
        try:
            contract = Contract.objects.get(id=id)
            
            review = Review.objects.create(
                contract=contract,
                lawyer=request.user,
                status=request.data.get('status', 'PENDING'),
                review_notes=request.data.get('review_notes', '')
            )
            
            contract.status = 'UNDER_REVIEW' if review.status == 'PENDING' else review.status
            contract.save()
            
            return Response(ReviewSerializer(review).data)
        except Contract.DoesNotExist:
            return Response({'error': 'Contract not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ContractAnalyzeView(APIView):
    permission_classes = [ContractPermissions]
    
    def post(self, request, id):
        try:
            contract = Contract.objects.get(id=id)
            analysis = analyze_contract(contract.full_text)
            return Response({'analysis': analysis}, status=status.HTTP_200_OK)
        except Contract.DoesNotExist:
            return Response({'error': 'Contract not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SignatureVerifyView(APIView):
    permission_classes = []
    
    def get(self, request, signature_id):
        try:
            signature = Signature.objects.get(id=signature_id)
            contract = signature.contract
            
            contract_metadata = {
                'id': contract.id,
                'contract_type': contract.contract_type,
                'status': contract.status,
                'data': sort_dict_recursive(contract.data),
                'needs_review': contract.needs_review,
                'is_locked': contract.is_locked
            }
            contract_metadata_str = json.dumps(contract_metadata, separators=(',', ':'), sort_keys=True, ensure_ascii=False)
            contract_hash = hashlib.sha256(contract_metadata_str.encode('utf-8')).digest()
            
            try:
                public_key = serialization.load_pem_public_key(
                    signature.public_key.encode('utf-8'),
                    backend=default_backend()
                )
                public_key.verify(
                    base64.b64decode(signature.signature_hash),
                    contract_hash,
                    padding.PSS(
                        mgf=padding.MGF1(hashes.SHA256()),
                        salt_length=32
                    ),
                    hashes.SHA256()
                )
                return Response({
                    'status': 'valid',
                    'message': f'Signature {signature.id} is valid for contract {contract.id}',
                    'signed_by':  signature.user.fullname,
                    'signed_at': signature.signed_at
                }, status=status.HTTP_200_OK)
            except InvalidSignature:
                return Response({
                    'status': 'invalid',
                    'message': f'Signature verification failed for contract {contract.id}'
                }, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                logger.error(f"Signature verification error for signature {signature_id}: {str(e)}")
                return Response({
                    'status': 'invalid',
                    'message': f'Signature verification failed: {str(e)}'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Signature.DoesNotExist:
            return Response({'error': 'Signature not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Unexpected error in signature verification: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ContractSignaturesView(APIView):
    permission_classes = [ContractPermissions]
    
    def get(self, request, contract_id):
        try:
            contract = Contract.objects.get(id=contract_id)
            
            signatures = contract.signatures.all()
            signature_data = []
            
            contract_metadata = {
                'id': contract.id,
                'contract_type': contract.contract_type,
                'status': contract.status,
                'data': sort_dict_recursive(contract.data),
                'needs_review': contract.needs_review,
                'is_locked': contract.is_locked
            }
            contract_metadata_str = json.dumps(contract_metadata, separators=(',', ':'), sort_keys=True, ensure_ascii=False)
            contract_hash = hashlib.sha256(contract_metadata_str.encode('utf-8')).digest()
            
            for signature in signatures:
                try:
                    public_key = serialization.load_pem_public_key(
                        signature.public_key.encode('utf-8'),
                        backend=default_backend()
                    )
                    public_key.verify(
                        base64.b64decode(signature.signature_hash),
                        contract_hash,
                        padding.PSS(
                            mgf=padding.MGF1(hashes.SHA256()),
                            salt_length=32
                        ),
                        hashes.SHA256()
                    )
                    verification_status = 'valid'
                except Exception:
                    verification_status = 'invalid'
                
                signature_serializer = SignatureSerializer(signature).data
                signature_serializer['verification_status'] = verification_status
                signature_data.append(signature_serializer)
            
            return Response(signature_data, status=status.HTTP_200_OK)
        except Contract.DoesNotExist:
            return Response({'error': 'Contract not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error fetching contract signatures: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LawyerPermission(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return (
            user and user.is_authenticated and (
                user.is_staff or
                (user.role and user.role.name == 'Lawyer')
            )
        )

class ContractAnalyticsView(APIView):
    permission_classes = [ContractPermissions]
    
    def get(self, request):
        try:
            type_counts = Contract.objects.values('contract_type').annotate(count=Count('id'))
            status_counts = Contract.objects.values('status').annotate(count=Count('id'))
            
            reviews = Review.objects.filter(status__in=['APPROVED', 'REJECTED'])
            avg_review_time = reviews.aggregate(avg_time=Avg(models.F('updated_at') - models.F('created_at')))['avg_time']
            
            if request.query_params.get('export') == 'csv':
                response = HttpResponse(content_type='text/csv')
                response['Content-Disposition'] = f'attachment; filename="contract_analytics_{datetime.now().strftime("%Y%m%d")}.csv"'
                
                writer = csv.writer(response)
                writer.writerow(['Metric', 'Value'])
                
                for item in type_counts:
                    writer.writerow([f"Contracts of type {item['contract_type']}", item['count']])
                for item in status_counts:
                    writer.writerow([f"Contracts in {item['status']} status", item['count']])
                writer.writerow(['Average review time (days)', 
                               f"{avg_review_time.total_seconds() / 86400 if avg_review_time else 0:.2f}"])
                
                return response
                
            return Response({
                'type_counts': type_counts,
                'status_counts': status_counts,
                'average_review_time_days': avg_review_time.total_seconds() / 86400 if avg_review_time else 0
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

from weasyprint.text.fonts import FontConfiguration
from weasyprint import HTML, CSS
import os
from django.conf import settings
class ContractExportView(APIView):
    permission_classes = [ContractPermissions]
    
    def post(self, request, id):
        try:
            logger.debug(f"Starting PDF export process for contract ID: {id}, user: {request.user.id}")
            print(f"DEBUG: Initiating PDF export for contract ID: {id}, user: {request.user.id}")
            
            # Validate contract ID
            if not isinstance(id, int) and not str(id).isdigit():
                logger.error(f"Invalid contract ID format: {id}")
                print(f"ERROR: Invalid contract ID format: {id}")
                return Response(
                    {'error': 'Invalid contract ID format'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get contract
            try:
                logger.debug(f"Fetching contract with ID: {id}")
                print(f"DEBUG: Attempting to fetch contract ID: {id}")
                contract = Contract.objects.get(id=id)
                logger.debug(f"Successfully fetched contract: ID={contract.id}, type={contract.contract_type}, status={contract.status}")
                print(f"DEBUG: Contract fetched: ID={contract.id}, type={contract.contract_type}, status={contract.status}")
            except Contract.DoesNotExist:
                logger.error(f"Contract not found: {id}")
                print(f"ERROR: Contract not found: {id}")
                return Response(
                    {'error': 'Contract not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Prepare HTML content
            html_content = contract.full_text
            if not html_content:
                logger.error(f"Contract {id} has no HTML content")
                print(f"ERROR: Contract {id} has no HTML content")
                return Response(
                    {'error': 'Contract has no content to export'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # SOLUTION 1: Use absolute file paths for fonts
            font_config = FontConfiguration()
            
            # Define font paths - adjust these paths to match your actual font locations
            font_base_path = os.path.join(settings.BASE_DIR, 'static', 'fonts')
            amiri_regular_path = os.path.join(font_base_path, 'amiri-regular.ttf')
            amiri_bold_path = os.path.join(font_base_path, 'amiri-bold.ttf')
            inter_regular_path = os.path.join(font_base_path, 'inter-regular.ttf')
            inter_bold_path = os.path.join(font_base_path, 'inter-bold.ttf')
            
            # Check if fonts exist and provide fallback
            fonts_available = all(os.path.exists(path) for path in [
                amiri_regular_path, amiri_bold_path, inter_regular_path, inter_bold_path
            ])
            
            if fonts_available:
                # Use custom fonts with absolute paths
                css_content = f"""
                    @page {{
                        size: A4;
                        margin: 3mm;
                    }}
                    @font-face {{
                        font-family: 'Amiri';
                        src: url('file://{amiri_regular_path}') format('truetype');
                        font-weight: normal;
                        font-style: normal;
                    }}
                    @font-face {{
                        font-family: 'Amiri';
                        src: url('file://{amiri_bold_path}') format('truetype');
                        font-weight: bold;
                        font-style: normal;
                    }}
                    @font-face {{
                        font-family: 'Inter';
                        src: url('file://{inter_regular_path}') format('truetype');
                        font-weight: normal;
                        font-style: normal;
                    }}
                    @font-face {{
                        font-family: 'Inter';
                        src: url('file://{inter_bold_path}') format('truetype');
                        font-weight: bold;
                        font-style: normal;
                    }}
                    * {{
                        box-sizing: border-box;
                        margin: 0;
                        padding: 0;
                    }}
                    html {{
                        font-family: 'Amiri', 'Inter', Arial, sans-serif;
                        font-size: 9pt;
                    }}
                    body {{
                        font-family: 'Amiri', 'Inter', Arial, sans-serif;
                        background: white;
                        padding: 3mm;
                        direction: rtl;
                        text-align: right;
                        color: #000;
                        line-height: 1.2;
                    }}
                    .container {{
                        max-width: 204mm;
                        margin: 0 auto;
                        background: white;
                        border: 1px solid #000;
                        padding: 8mm;
                    }}
                    .header {{
                        text-align: center;
                        margin-bottom: 8mm;
                        padding-bottom: 3mm;
                        border-bottom: 1px solid #000;
                        break-inside: avoid;
                    }}
                    .header h1 {{
                        font-family: 'Amiri', Arial, sans-serif;
                        font-size: 14pt;
                        font-weight: bold;
                        color: #000;
                        margin-bottom: 2mm;
                        text-transform: uppercase;
                    }}
                    .header .english {{
                        font-family: 'Inter', Arial, sans-serif;
                        font-size: 10pt;
                        font-weight: normal;
                        color: #333;
                        font-style: italic;
                    }}
                    .section {{
                        margin-bottom: 3mm;
                        break-inside: avoid;
                    }}
                    .section-title {{
                        font-family: 'Amiri', Arial, sans-serif;
                        font-size: 10pt;
                        font-weight: bold;
                        color: #000;
                        margin-bottom: 2mm;
                        text-decoration: underline;
                        text-align: right;
                    }}
                    .section-title .english {{
                        font-family: 'Inter', Arial, sans-serif;
                        font-style: italic;
                        font-weight: normal;
                        color: #666;
                    }}
                    .section-content {{
                        font-family: 'Amiri', Arial, sans-serif;
                        color: #000;
                        font-size: 8pt;
                        text-align: justify;
                        margin-right: 3mm;
                    }}
                    .section-content p {{
                        margin-bottom: 2mm;
                    }}
                    .form-field {{
                        display: inline-block;
                        border-bottom: 1px solid #000;
                        min-width: 50mm;
                        padding: 0.5mm 1mm;
                        margin: 0 0.5mm;
                        font-weight: bold;
                    }}
                    .signature-section {{
                        margin-top: 5mm;
                        padding-top: 3mm;
                        border-top: 1px solid #000;
                        break-inside: avoid;
                    }}
                    .signature-entry {{
                        margin-bottom: 3mm;
                    }}
                    .signature-entry p {{
                        font-family: 'Inter', Arial, sans-serif;
                        margin-bottom: 1mm;
                        font-size: 8pt;
                    }}
                    .signature-entry img {{
                        margin-top: 1mm;
                        width: 15mm;
                        height: 15mm;
                    }}
                """
                logger.debug(f"Using custom fonts for contract {id}")
                print(f"DEBUG: Using custom fonts for contract {id}")
            else:
                # Fallback to system fonts only
                css_content = """
                    @page {
                        size: A4;
                        margin: 3mm;
                    }
                    * {
                        box-sizing: border-box;
                        margin: 0;
                        padding: 0;
                    }
                    html {
                        font-family: Arial, 'Times New Roman', sans-serif;
                        font-size: 9pt;
                    }
                    body {
                        font-family: Arial, 'Times New Roman', sans-serif;
                        background: white;
                        padding: 3mm;
                        direction: rtl;
                        text-align: right;
                        color: #000;
                        line-height: 1.2;
                    }
                    .container {
                        max-width: 204mm;
                        margin: 0 auto;
                        background: white;
                        border: 1px solid #000;
                        padding: 8mm;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 8mm;
                        padding-bottom: 3mm;
                        border-bottom: 1px solid #000;
                        break-inside: avoid;
                    }
                    .header h1 {
                        font-family: Arial, 'Times New Roman', sans-serif;
                        font-size: 14pt;
                        font-weight: bold;
                        color: #000;
                        margin-bottom: 2mm;
                        text-transform: uppercase;
                    }
                    .header .english {
                        font-family: Arial, 'Times New Roman', sans-serif;
                        font-size: 10pt;
                        font-weight: normal;
                        color: #333;
                        font-style: italic;
                    }
                    .section {
                        margin-bottom: 3mm;
                        break-inside: avoid;
                    }
                    .section-title {
                        font-family: Arial, 'Times New Roman', sans-serif;
                        font-size: 10pt;
                        font-weight: bold;
                        color: #000;
                        margin-bottom: 2mm;
                        text-decoration: underline;
                        text-align: right;
                    }
                    .section-title .english {
                        font-family: Arial, 'Times New Roman', sans-serif;
                        font-style: italic;
                        font-weight: normal;
                        color: #666;
                    }
                    .section-content {
                        font-family: Arial, 'Times New Roman', sans-serif;
                        color: #000;
                        font-size: 8pt;
                        text-align: justify;
                        margin-right: 3mm;
                    }
                    .section-content p {
                        margin-bottom: 2mm;
                    }
                    .form-field {
                        display: inline-block;
                        border-bottom: 1px solid #000;
                        min-width: 50mm;
                        padding: 0.5mm 1mm;
                        margin: 0 0.5mm;
                        font-weight: bold;
                    }
                    .signature-section {
                        margin-top: 5mm;
                        padding-top: 3mm;
                        border-top: 1px solid #000;
                        break-inside: avoid;
                    }
                    .signature-entry {
                        margin-bottom: 3mm;
                    }
                    .signature-entry p {
                        font-family: Arial, 'Times New Roman', sans-serif;
                        margin-bottom: 1mm;
                        font-size: 8pt;
                    }
                    .signature-entry img {
                        margin-top: 1mm;
                        width: 15mm;
                        height: 15mm;
                    }
                """
                logger.warning(f"Font files not found, using system fonts for contract {id}")
                print(f"WARNING: Font files not found, using system fonts for contract {id}")
            
            try:
                logger.debug(f"Generating PDF for contract {id}")
                print(f"DEBUG: Generating PDF for contract {id}")
                
                # Generate PDF using weasyprint
                html = HTML(string=html_content)
                css = CSS(string=css_content, font_config=font_config)
                pdf_buffer = html.write_pdf(stylesheets=[css], font_config=font_config)
                
                # Prepare HTTP response
                response = HttpResponse(
                    content_type='application/pdf',
                    content=pdf_buffer
                )
                response['Content-Disposition'] = f'attachment; filename="contract_{id}.pdf"'
                
                # Update contract status
                try:
                    contract.status = 'EXPORTED'
                    contract.save()
                    logger.debug(f"Contract {id} status updated to EXPORTED")
                    print(f"DEBUG: Contract {id} status updated to EXPORTED")
                except Exception as e:
                    logger.error(f"Error updating contract status for contract {id}: {str(e)}")
                    print(f"ERROR: Failed to update contract status for contract {id}: {str(e)}")
                    # Don't return error here, PDF generation was successful
                
                logger.info(f"Successfully generated PDF for contract {id}")
                print(f"INFO: PDF generated successfully for contract {id}")
                return response
                
            except Exception as e:
                logger.error(f"Error generating PDF for contract {id}: {str(e)}")
                print(f"ERROR: Failed to generate PDF for contract {id}: {str(e)}")
                return Response(
                    {'error': f'Failed to generate PDF: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                
        except Exception as e:
            logger.error(f"Unexpected error in PDF export for contract {id}: {str(e)}")
            print(f"ERROR: Unexpected error during PDF export for contract {id}: {str(e)}")
            return Response(
                {'error': 'An unexpected error occurred'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
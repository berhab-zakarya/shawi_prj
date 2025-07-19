from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q

from .signals import send_notification_email
from .models import Contract, Review, Signature
from .admin_serializers import AdminContractSerializer, AdminReviewSerializer, AdminSignatureSerializer
from .permissions import ContractPermissions
from django.contrib.auth import get_user_model
from .utils.pdf_generator import generate_pdf
from .utils.doc_generator import generate_docx
from contracts.utils.gpt_integration import generate_contract_html, analyze_contract
from django.template.loader import render_to_string
from barcode import Code128
from barcode.writer import SVGWriter
from io import BytesIO
from django.core.mail import send_mail
from celery import shared_task
from datetime import datetime

User = get_user_model()

class AdminPermission(ContractPermissions):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role and request.user.role.name == 'Admin'

class AdminContractListView(APIView):
    permission_classes = [AdminPermission]
    
    def get(self, request):
        contracts = Contract.objects.all()
        
        # Filter by status if provided
        status_filter = request.query_params.get('status')
        if status_filter:
            contracts = contracts.filter(status=status_filter)
            
        # Filter by contract type if provided
        type_filter = request.query_params.get('contract_type')
        if type_filter:
            contracts = contracts.filter(contract_type=type_filter)
            
        # Filter by client email if provided
        client_email = request.query_params.get('client_email')
        if client_email:
            contracts = contracts.filter(client__email__icontains=client_email)
            
        serializer = AdminContractSerializer(contracts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class AdminContractUpdateView(APIView):
    permission_classes = [AdminPermission]
    
    def put(self, request, id):
        try:
            contract = Contract.objects.get(id=id)
            serializer = AdminContractSerializer(contract, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Contract.DoesNotExist:
            return Response({'error': 'Contract not found'}, status=status.HTTP_404_NOT_FOUND)

class AdminContractDeleteView(APIView):
    permission_classes = [AdminPermission]
    
    def delete(self, request, id):
        try:
            contract = Contract.objects.get(id=id)
            contract.delete()
            return Response({'message': 'Contract deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        except Contract.DoesNotExist:
            return Response({'error': 'Contract not found'}, status=status.HTTP_404_NOT_FOUND)

class AdminContractAssignLawyerView(APIView):
    permission_classes = [AdminPermission]
    
    def post(self, request, id):
        try:
            contract = Contract.objects.get(id=id)
            lawyer_id = request.data.get('lawyer_id')
            if not lawyer_id:
                return Response({'error': 'lawyer_id is required'}, status=status.HTTP_400_BAD_REQUEST)
                
            lawyer = User.objects.get(id=lawyer_id, role__name='Lawyer')
            review = Review.objects.create(
                contract=contract,
                lawyer=lawyer,
                status='PENDING',
                review_notes='Assigned by admin'
            )
            
            contract.status = 'UNDER_REVIEW'
            contract.needs_review = True
            contract.save()
            
            # Send notification to lawyer
            send_notification_email.delay(
                lawyer.email,
                'New Contract Assigned for Review',
                f'You have been assigned to review contract {contract.id} by admin.'
            )
            
            return Response(AdminReviewSerializer(review).data, status=status.HTTP_201_CREATED)
        except Contract.DoesNotExist:
            return Response({'error': 'Contract not found'}, status=status.HTTP_404_NOT_FOUND)
        except User.DoesNotExist:
            return Response({'error': 'Lawyer not found'}, status=status.HTTP_404_NOT_FOUND)

class AdminContractStatusView(APIView):
    permission_classes = [AdminPermission]
    
    def post(self, request, id):
        try:
            contract = Contract.objects.get(id=id)
            new_status = request.data.get('status')
            
            if new_status not in dict(Contract.STATUS_CHOICES).keys():
                return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
                
            contract.status = new_status
            if new_status in ['APPROVED', 'COMPLETED']:
                contract.is_locked = True
            elif new_status in ['DRAFT', 'UNDER_REVIEW']:
                contract.is_locked = False
            contract.save()
            
            # Notify client of status change
            send_notification_email.delay(
                contract.client.email,
                'Contract Status Update',
                f'Contract {contract.id} status has been updated to {new_status} by admin.'
            )
            
            return Response(AdminContractSerializer(contract).data, status=status.HTTP_200_OK)
        except Contract.DoesNotExist:
            return Response({'error': 'Contract not found'}, status=status.HTTP_404_NOT_FOUND)

class AdminContractForceSignView(APIView):
    permission_classes = [AdminPermission]
    
    def post(self, request, id):
        try:
            contract = Contract.objects.get(id=id)
            if contract.is_locked and contract.status != 'COMPLETED':
                return Response({'error': 'Contract is locked'}, status=status.HTTP_400_BAD_REQUEST)
                
            user_id = request.data.get('user_id')
            if not user_id:
                return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
                
            user = User.objects.get(id=user_id)
            
            signature = Signature.objects.create(
                contract=contract,
                user=user,
                ip_address=request.META.get('REMOTE_ADDR', '0.0.0.0')
            )
            
            barcode_io = BytesIO()
            Code128(str(signature.id), writer=SVGWriter()).write(barcode_io)
            signature.barcode_svg = barcode_io.getvalue().decode('utf-8')
            signature.save()
            
            context = {
                'contract_type': contract.contract_type,
                'data_items': contract.data.items(),
                'created_at': contract.created_at,
                'signatures': contract.signatures.all(),
                'gpt_html': contract.text_version
            }
            contract.full_text = render_to_string('contract_template.html', context)
            
            if user.role.name == 'Lawyer':
                contract.status = 'SIGNED_BY_LAWYER'
            else:
                contract.status = 'SIGNED_BY_CLIENT'
                
            if contract.signatures.count() >= 2:
                contract.status = 'COMPLETED'
                contract.is_locked = True
            contract.save()
            
            # Notify user of admin-forced signature
            send_notification_email.delay(
                user.email,
                'Contract Signature Added',
                f'Admin has added your signature to contract {contract.id}.'
            )
            
            return Response(AdminSignatureSerializer(signature).data, status=status.HTTP_201_CREATED)
        except Contract.DoesNotExist:
            return Response({'error': 'Contract not found'}, status=status.HTTP_404_NOT_FOUND)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class AdminContractExportAllView(APIView):
    permission_classes = [AdminPermission]
    
    def post(self, request):
        try:
            format = request.data.get('format', 'pdf')
            contracts = Contract.objects.all()
            
            if format not in ['pdf', 'docx']:
                return Response({'error': 'Invalid format'}, status=status.HTTP_400_BAD_REQUEST)
                
            response = HttpResponse(content_type=f'application/{"pdf" if format == "pdf" else "vnd.openxmlformats-officedocument.wordprocessingml.document"}')
            response['Content-Disposition'] = f'attachment; filename="all_contracts_{datetime.now().strftime("%Y%m%d")}.{format}"'
            
            for contract in contracts:
                if format == 'pdf':
                    pdf = generate_pdf(contract)
                    response.write(pdf)
                else:
                    doc = generate_docx(contract)
                    doc.save(response)
                
                contract.status = 'EXPORTED'
                contract.save()
                
            return response
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
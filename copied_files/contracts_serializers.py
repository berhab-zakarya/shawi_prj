import json
from rest_framework import serializers

from .models import Contract, Review, Signature
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.backends import default_backend
import hashlib
import base64

def sort_dict_recursive(d):
    if not isinstance(d, dict):
        return d
    return {k: sort_dict_recursive(v) for k, v in sorted(d.items())}

class ContractSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contract
        fields = ['id', 'contract_type', 'status', 'data', 'full_text', 'needs_review', 'is_locked', 'created_at', 'updated_at']
from django.contrib.auth import get_user_model
User = get_user_model()
class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='role.name', allow_null=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role']

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'contract', 'lawyer', 'status', 'review_notes', 'created_at', 'updated_at']

class AssignReviewSerializer(serializers.ModelSerializer):
    lawyer = UserSerializer(read_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'contract', 'lawyer', 'status', 'review_notes', 'created_at', 'updated_at']


class SignatureSerializer(serializers.ModelSerializer):
    verification_status = serializers.SerializerMethodField()

    class Meta:
        model = Signature
        fields = ['id', 'contract', 'user', 'ip_address', 'signed_at', 'signature_hash', 'public_key', 'barcode_svg', 'verification_status']

    def get_verification_status(self, obj):
        try:
            public_key = serialization.load_pem_public_key(
                obj.public_key.encode(),
                backend=default_backend()
            )
            contract_metadata = {
                'id': obj.contract.id,
                'contract_type': obj.contract.contract_type,
                'status': obj.contract.status,
                'data': sort_dict_recursive(obj.contract.data),
                'needs_review': obj.contract.needs_review,
                'is_locked': obj.contract.is_locked
            }
            contract_metadata_str = json.dumps(contract_metadata, separators=(',', ':'), sort_keys=True)
            contract_hash = hashlib.sha256(contract_metadata_str.encode()).digest()
            public_key.verify(
                base64.b64decode(obj.signature_hash),
                contract_hash,
                padding.PSS(
                    mgf=padding.MGF1(hashes.SHA256()),
                    salt_length=32
                ),
                hashes.SHA256()
            )
            return 'valid'
        except Exception as e:
            return 'invalid'
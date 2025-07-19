from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Contract, Review, Signature

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='role.name', allow_null=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role']

class AdminSignatureSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Signature
        fields = ['id', 'contract', 'user', 'ip_address', 'signed_at', 'barcode_svg']

class AdminReviewSerializer(serializers.ModelSerializer):
    lawyer = UserSerializer(read_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'contract', 'lawyer', 'status', 'review_notes', 'created_at', 'updated_at']

class AdminContractSerializer(serializers.ModelSerializer):
    client = UserSerializer(read_only=True)
    reviews = AdminReviewSerializer(many=True, read_only=True)
    signatures = AdminSignatureSerializer(many=True, read_only=True)
    
    class Meta:
        model = Contract
        fields = [
            'id',
            'client',
            'contract_type',
            'status',
            'data',
            'text_version',
            'full_text',
            'needs_review',
            'is_locked',
            'created_at',
            'updated_at',
            'reviews',
            'signatures',
        ]
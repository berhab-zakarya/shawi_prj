from django.db import models
from django.contrib.auth import get_user_model
User = get_user_model()

class Contract(models.Model):
    CONTRACT_TYPES = (
        ('EMPLOYMENT', 'Employment'),
        ('NDA', 'Non-Disclosure Agreement'),
        ('FREELANCE', 'Freelance Service Agreement'),
        ('LEASE', 'Lease Agreement'),
        ('PARTNERSHIP', 'Partnership Agreement'),
        ('SALES', 'Sales Contract'),
        ('CUSTOM', 'Custom Draft'),
    )
    
    STATUS_CHOICES = (
        ('DRAFT', 'Draft'),
        ('UNDER_REVIEW', 'Under Review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('SIGNED_BY_CLIENT', 'Signed by Client'),
        ('SIGNED_BY_LAWYER', 'Signed by Lawyer'),
        ('COMPLETED', 'Completed'),
        ('EXPORTED', 'Exported'),
    )

    client = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    contract_type = models.CharField(max_length=50, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    data = models.JSONField()
    text_version = models.TextField(blank=True)
    full_text = models.TextField(blank=True)
    needs_review = models.BooleanField(default=False)
    is_locked = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Review(models.Model):
    contract = models.ForeignKey(Contract, related_name='reviews', on_delete=models.CASCADE)
    lawyer = models.ForeignKey(User, related_name='reviews', on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=(
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ), default='PENDING')
    review_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Signature(models.Model):
    contract = models.ForeignKey(Contract, related_name='signatures', on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name='signatures', on_delete=models.CASCADE)
    ip_address = models.GenericIPAddressField()
    signed_at = models.DateTimeField(auto_now_add=True)
    signature_hash = models.TextField()  
    public_key = models.TextField()    
    barcode_svg = models.TextField(blank=True)
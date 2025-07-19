from rest_framework import serializers
from .models import Invoice, InvoiceItem
from marketplace.models import Service

class InvoiceItemSerializer(serializers.ModelSerializer):
    service_title = serializers.CharField(source='service.title', read_only=True)
    
    class Meta:
        model = InvoiceItem
        fields = ['id', 'description', 'quantity', 'unit_price', 'total_price', 'service', 'service_title']

class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    service_request = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'issue_date', 'due_date', 'language',
            'subtotal', 'tax_rate', 'tax_amount', 'discount_amount', 'total_amount',
            'status', 'status_display', 'is_sent', 'sent_at', 'is_overdue',
            'pdf_file', 'items', 'created_at', 'updated_at', 'service_request'
        ]

from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.http import HttpResponse
from .models import Invoice, InvoiceItem
from .utils import InvoiceGenerator

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = [
        'invoice_number', 'user', 'total_amount', 'status', 
        'issue_date', 'due_date', 'is_sent', 'pdf_link'
    ]
    list_filter = ['status', 'is_sent', 'language', 'issue_date']
    search_fields = ['invoice_number', 'user__email', 'user__username']
    readonly_fields = ['invoice_number', 'total_amount', 'tax_amount', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('invoice_number', 'service_request', 'user', 'language')
        }),
        ('Dates', {
            'fields': ('issue_date', 'due_date')
        }),
        ('Financial Details', {
            'fields': ('subtotal', 'tax_rate', 'tax_amount', 'discount_amount', 'total_amount')
        }),
        ('Status', {
            'fields': ('status', 'is_sent', 'sent_at')
        }),
        ('File', {
            'fields': ('pdf_file',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    actions = ['generate_pdf', 'send_invoice']
    
    def pdf_link(self, obj):
        if obj.pdf_file:
            return format_html(
                '<a href="{}" target="_blank">View PDF</a>',
                obj.pdf_file.url
            )
        return "No PDF"
    pdf_link.short_description = "PDF"
    
    def generate_pdf(self, request, queryset):
        """Generate PDF for selected invoices"""
        for invoice in queryset:
            InvoiceGenerator.generate_pdf(invoice)
        
        self.message_user(request, f"PDF generated for {queryset.count()} invoices")
    generate_pdf.short_description = "Generate PDF"
    
    def send_invoice(self, request, queryset):
        """Send selected invoices via email"""
        from .tasks import send_invoice_email
        
        for invoice in queryset:
            send_invoice_email.delay(invoice.id)
        
        self.message_user(request, f"Email sent for {queryset.count()} invoices")
    send_invoice.short_description = "Send via Email"

@admin.register(InvoiceItem)
class InvoiceItemAdmin(admin.ModelAdmin):
    list_display = ['invoice', 'description', 'quantity', 'unit_price', 'total_price']
    list_filter = ['invoice__status', 'invoice__language']
    search_fields = ['description', 'invoice__invoice_number']

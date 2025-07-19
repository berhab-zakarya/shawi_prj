from celery import shared_task
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone
from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration
import os
import tempfile
from .models import Invoice
from .utils import InvoiceGenerator

@shared_task
def generate_and_send_invoice(invoice_id):
    """Generate PDF and send invoice via email"""
    try:
        invoice = Invoice.objects.get(id=invoice_id)
        
        # Generate PDF
        pdf_path = InvoiceGenerator.generate_pdf(invoice)
        
        if pdf_path:
            # Save PDF path to model
            invoice.pdf_file.name = pdf_path
            invoice.status = 'sent'
            invoice.is_sent = True
            invoice.sent_at = timezone.now()
            invoice.save()
            
            # Send email
            send_invoice_email(invoice)
            
            return f"Invoice {invoice.invoice_number} generated and sent successfully"
        else:
            return f"Failed to generate PDF for invoice {invoice.invoice_number}"
            
    except Invoice.DoesNotExist:
        return f"Invoice with ID {invoice_id} not found"
    except Exception as e:
        return f"Error processing invoice {invoice_id}: {str(e)}"

@shared_task
def send_invoice_email(invoice):
    """Send invoice via email"""
    try:
        subject = f"Invoice {invoice.invoice_number}" if invoice.language == 'en' else f"فاتورة {invoice.invoice_number}"
        
        # Render email template
        template_name = f'invoices/emails/invoice_email_{invoice.language}.html'
        html_content = render_to_string(template_name, {
            'invoice': invoice,
            'user': invoice.user,
            'company_name': getattr(settings, 'COMPANY_NAME', 'Your Company')
        })
        
        # Create email
        email = EmailMessage(
            subject=subject,
            body=html_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[invoice.user.email],
        )
        email.content_subtype = 'html'
        
        # Attach PDF if exists
        if invoice.pdf_file:
            email.attach_file(invoice.pdf_file.path)
        
        email.send()
        
        return f"Invoice email sent to {invoice.user.email}"
        
    except Exception as e:
        return f"Error sending email: {str(e)}"

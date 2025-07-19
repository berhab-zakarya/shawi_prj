from decimal import Decimal
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from .models import Invoice, InvoiceItem
from .tasks import generate_and_send_invoice
from marketplace.models import ServiceRequest

@receiver(post_save, sender=ServiceRequest)
def create_invoice_on_payment(sender, instance, created, **kwargs):
    """Create invoice when service request is paid"""
    if instance.status == 'Paid' and not hasattr(instance, '_invoice_created'):
        # Prevent duplicate invoice creation
        if not instance.invoices.exists():
            # Create invoice with 30 days due date
            due_date = timezone.now().date() + timezone.timedelta(days=30)
            
            invoice = Invoice.objects.create(
                service_request=instance,
                user=instance.client,
                due_date=due_date,
                language='en',  # Default to English; adjust based on user preference if available
                subtotal=instance.service.price,
                tax_rate=Decimal('0.00'),  # Adjust based on your tax logic
                status='draft'
            )
            
            # Create invoice item from service
            InvoiceItem.objects.create(
                invoice=invoice,
                service=instance.service,
                description=instance.service.title,
                quantity=1,
                unit_price=instance.service.price
            )
            
            # Trigger async task to generate PDF and send email
            generate_and_send_invoice.delay(invoice.id)
            
            # Mark to prevent re-creation
            instance._invoice_created = True

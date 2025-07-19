from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpResponse
from django.core.paginator import Paginator
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from invoices.tasks import generate_and_send_invoice, send_invoice_email
from .models import Invoice, InvoiceItem
from .serializers import InvoiceSerializer
from .utils import InvoiceGenerator
from django.utils import timezone
from decimal import Decimal
from marketplace.models import Service

from django.contrib.auth import get_user_model
@login_required
def invoice_list(request):
    """List user's invoices"""
    invoices = Invoice.objects.filter(user=request.user).order_by('-created_at')
    
    # Search functionality
    search_query = request.GET.get('search', '')
    if search_query:
        invoices = invoices.filter(
            Q(invoice_number__icontains=search_query) |
            Q(service_request__id__icontains=search_query)
        )
    
    # Pagination
    paginator = Paginator(invoices, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'invoices': page_obj,
        'search_query': search_query,
    }
    
    return render(request, 'invoices/invoice_list.html', context)

@login_required
def invoice_detail(request, invoice_number):
    """View invoice details"""
    invoice = get_object_or_404(Invoice, invoice_number=invoice_number, user=request.user)
    
    context = {
        'invoice': invoice,
        'items': invoice.items.all(),
    }
    
    return render(request, 'invoices/invoice_detail.html', context)

@login_required
def download_invoice_pdf(request, invoice_number):
    """Download invoice PDF"""
    invoice = get_object_or_404(Invoice, invoice_number=invoice_number, user=request.user)
    
    if not invoice.pdf_file:
        # Generate PDF if not exists
        pdf_path = InvoiceGenerator.generate_pdf(invoice)
        if pdf_path:
            invoice.pdf_file.name = pdf_path
            invoice.save()
    
    if invoice.pdf_file:
        response = HttpResponse(
            invoice.pdf_file.read(),
            content_type='application/pdf'
        )
        response['Content-Disposition'] = f'attachment; filename="invoice_{invoice.invoice_number}.pdf"'
        return response
    
    return HttpResponse("PDF not available", status=404)

# API Views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_invoice_list(request):
    invoices = Invoice.objects.filter(user=request.user).order_by('-created_at')
    search_query = request.GET.get('search', '')
    status = request.GET.get('status', '')
    start_date = request.GET.get('start_date', '')
    end_date = request.GET.get('end_date', '')
    if search_query:
        invoices = invoices.filter(
            Q(invoice_number__icontains=search_query) |
            Q(service_request__id__icontains=search_query)
        )
    if status:
        invoices = invoices.filter(status=status)
    if start_date:
        invoices = invoices.filter(issue_date__gte=start_date)
    if end_date:
        invoices = invoices.filter(issue_date__lte=end_date)
    serializer = InvoiceSerializer(invoices, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_invoice_detail(request, invoice_number):
    """API endpoint for invoice details"""
    invoice = get_object_or_404(Invoice, invoice_number=invoice_number, user=request.user)
    serializer = InvoiceSerializer(invoice)
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def api_update_invoice_status(request, invoice_number):
    invoice = get_object_or_404(Invoice, invoice_number=invoice_number, user=request.user)
    status = request.data.get('status')
    if status not in dict(Invoice.STATUS_CHOICES).keys():
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
    invoice.status = status
    invoice.save()
    return Response({'status': 'success'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_send_invoice_reminder(request, invoice_number):
    invoice = get_object_or_404(Invoice, invoice_number=invoice_number, user=request.user)
    if not invoice.is_overdue:
        return Response({'error': 'Invoice is not overdue'}, status=status.HTTP_400_BAD_REQUEST)
    send_invoice_email.delay(invoice.id)  # Reuse existing Celery task
    return Response({'status': 'success'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_create_invoice(request):
    data = request.data
    client_id = data.get('clientId')
    service_description = data.get('serviceDescription')
    quantity = data.get('quantity')
    unit_price = data.get('unitPrice')
    tax_rate = data.get('taxRate', 0.00)
    discount_amount = data.get('discountAmount', 0.00)
    language = data.get('language', 'en')
    
    if not all([client_id, service_description, quantity, unit_price]):
        return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        client = get_user_model().objects.get(id=client_id)
        invoice = Invoice.objects.create(
            user=client,
            due_date=timezone.now().date() + timezone.timedelta(days=30),
            language=language,
            subtotal=Decimal(unit_price) * quantity,
            tax_rate=Decimal(tax_rate),
            discount_amount=Decimal(discount_amount),
            status='draft'
        )
        InvoiceItem.objects.create(
            invoice=invoice,
            description=service_description,
            quantity=quantity,
            unit_price=Decimal(unit_price)
        )
        generate_and_send_invoice.delay(invoice.id)
        return Response({'status': 'success', 'invoice_number': invoice.invoice_number}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
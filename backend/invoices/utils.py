from django.template.loader import render_to_string
from django.conf import settings
from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration
import os
import tempfile
from .models import Invoice

class InvoiceGenerator:
    @staticmethod
    def generate_pdf(invoice):
        """Generate PDF for invoice"""
        try:
            # Determine template based on language
            template_name = f'invoices/pdf/invoice_{invoice.language}.html'
            
            # Render HTML
            html_content = render_to_string(template_name, {
                'invoice': invoice,
                'company': InvoiceGenerator.get_company_info(),
                'items': invoice.items.all(),
            })
            
            # Create CSS configuration
            font_config = FontConfiguration()
            
            # CSS files
            css_files = [
                CSS(string=InvoiceGenerator.get_base_css()),
                CSS(string=InvoiceGenerator.get_language_css(invoice.language)),
            ]
            
            # Generate PDF
            html_doc = HTML(string=html_content, base_url=settings.BASE_DIR)
            pdf_buffer = html_doc.write_pdf(
                stylesheets=css_files,
                font_config=font_config
            )
            
            # Save to file
            pdf_filename = f"invoice_{invoice.invoice_number}.pdf"
            pdf_dir = os.path.join(settings.MEDIA_ROOT, 'invoices', invoice.invoice_number)
            os.makedirs(pdf_dir, exist_ok=True)
            
            pdf_path = os.path.join(pdf_dir, pdf_filename)
            with open(pdf_path, 'wb') as f:
                f.write(pdf_buffer)
            
            # Return relative path for model
            return os.path.join('invoices', invoice.invoice_number, pdf_filename)
            
        except Exception as e:
            print(f"Error generating PDF: {str(e)}")
            return None
    
    @staticmethod
    def get_company_info():
        """Get company information for invoice"""
        return {
            'name': getattr(settings, 'COMPANY_NAME', 'Your Company'),
            'address': getattr(settings, 'COMPANY_ADDRESS', ''),
            'phone': getattr(settings, 'COMPANY_PHONE', ''),
            'email': getattr(settings, 'COMPANY_EMAIL', ''),
            'website': getattr(settings, 'COMPANY_WEBSITE', ''),
            'logo': getattr(settings, 'COMPANY_LOGO', ''),
        }
    
    @staticmethod
    def get_base_css():
        """Base CSS for invoices"""
        return """
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            color: #374151;
            line-height: 1.6;
            font-size: 14px;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        
        .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e5e7eb;
        }
        
        .logo {
            max-width: 200px;
            height: auto;
        }
        
        .invoice-title {
            font-size: 2.5rem;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 10px;
        }
        
        .invoice-number {
            font-size: 1.1rem;
            color: #6b7280;
            font-weight: 500;
        }
        
        .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
        }
        
        .company-info, .client-info {
            flex: 1;
        }
        
        .company-info h3, .client-info h3 {
            font-size: 1.1rem;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 10px;
        }
        
        .info-item {
            margin-bottom: 5px;
            color: #6b7280;
        }
        
        .invoice-meta {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        
        .meta-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        
        .meta-row:last-child {
            margin-bottom: 0;
        }
        
        .meta-label {
            font-weight: 500;
            color: #374151;
        }
        
        .meta-value {
            color: #6b7280;
        }
        
        .invoice-items {
            margin-bottom: 30px;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
        }
        
        .items-table th {
            background: #f9fafb;
            padding: 15px;
            text-align: left;
            font-weight: 600;
            color: #374151;
            border-bottom: 2px solid #e5e7eb;
        }
        
        .items-table td {
            padding: 15px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .items-table tr:hover {
            background: #f9fafb;
        }
        
        .text-right {
            text-align: right;
        }
        
        .text-center {
            text-align: center;
        }
        
        .invoice-summary {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
        }
        
        .summary-table {
            width: 100%;
            max-width: 400px;
            margin-left: auto;
        }
        
        .summary-table td {
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .summary-table .total-row {
            font-weight: 600;
            font-size: 1.1rem;
            color: #1f2937;
            border-top: 2px solid #e5e7eb;
            border-bottom: 2px solid #e5e7eb;
        }
        
        .invoice-footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 0.9rem;
        }
        
        .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
            text-transform: uppercase;
        }
        
        .status-paid {
            background: #d1fae5;
            color: #065f46;
        }
        
        .status-sent {
            background: #dbeafe;
            color: #1e40af;
        }
        
        .status-draft {
            background: #f3f4f6;
            color: #374151;
        }
        
        .status-overdue {
            background: #fee2e2;
            color: #991b1b;
        }
        
        @media print {
            .container {
                padding: 20px;
            }
            
            .invoice-header {
                page-break-inside: avoid;
            }
            
            .items-table {
                page-break-inside: avoid;
            }
        }
        """
    
    @staticmethod
    def get_language_css(language):
        """Language-specific CSS"""
        if language == 'ar':
            return """
            body {
                font-family: 'Noto Sans Arabic', sans-serif;
                direction: rtl;
                text-align: right;
            }
            
            .invoice-header {
                flex-direction: row-reverse;
            }
            
            .invoice-details {
                flex-direction: row-reverse;
            }
            
            .items-table th,
            .items-table td {
                text-align: right;
            }
            
            .items-table .text-center {
                text-align: center;
            }
            
            .summary-table {
                margin-right: auto;
                margin-left: 0;
            }
            
            .meta-row {
                flex-direction: row-reverse;
            }
            """
        return ""

from weasyprint import HTML

def generate_pdf(contract):
    html_content = contract.full_text or contract.text_version  
    if not html_content:
        raise ValueError("Contract text_version or full_text is empty. Generate contract text first.")
    pdf_file = HTML(string=html_content).write_pdf()
    return pdf_file
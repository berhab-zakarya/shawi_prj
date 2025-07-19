NDA_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>Non-Disclosure Agreement</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        p { margin: 5px 0; }
    </style>
</head>
<body>
    <h1>Non-Disclosure Agreement</h1>
    <p>This Non-Disclosure Agreement ("Agreement") is entered into between:</p>
    <p>Disclosing Party: {{ data.disclosing_party }}</p>
    <p>Receiving Party: {{ data.receiving_party }}</p>
    <p>Purpose: {{ data.purpose }}</p>
    <p>Effective Date: {{ data.effective_date }}</p>
    <p>Confidential Information: {{ data.confidential_info }}</p>
    <p>Term: {{ data.term }}</p>
    <p>Generated on: {{ created_at }}</p>
</body>
</html>
"""

TEMPLATES = {
    'NDA': NDA_TEMPLATE,
    # Add more templates (e.g., EMPLOYMENT) as needed
}
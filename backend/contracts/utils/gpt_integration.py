from openai import AsyncOpenAI
from django.conf import settings
from .template_registry import TEMPLATES
import logging


logger = logging.getLogger(__name__)

async def get_openai_client():
    """Initialize OpenAI client with OpenRouter configuration."""
    return AsyncOpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=settings.OPENROUTER_API_KEY
    )

async def generate_contract_html(contract):
    """Generate contract HTML using OpenAI API."""
    template = TEMPLATES.get(contract.contract_type)
    if not template:
        raise ValueError(f"No template found for contract type: {contract.contract_type}")
    
    # Prepare prompt for GPT
    prompt = f"""
    You are an expert in generating legal contract HTML. Given the following HTML template and user data, produce a clean, well-formatted HTML output suitable for PDF export. Ensure the output includes proper styling, uses the provided data to fill placeholders, and maintains the structure of the template. Return only the HTML content, without any additional text or explanations.

    **Template**:
    {template}

    **User Data**:
    - contract_type: {contract.contract_type}
    - data: {contract.data}
    - created_at: {contract.created_at}

    **Instructions**:
    - Replace placeholders (e.g., {{ data.disclosing_party }}) with the corresponding values from the user data.
    - Ensure the output is valid HTML with proper tags and styling.
    - Do not modify the CSS or structure unless necessary to incorporate the data.
    - Return only the final HTML string.
    """
    
    # Call GPT API
    return await call_gpt_api(prompt)

async def call_gpt_api(prompt):
    """Call OpenAI API to generate contract HTML."""
    try:
        client = await get_openai_client()
        response = await client.chat.completions.create(
            model="qwen/qwen3-14b:free",
            messages=[
                {
                    "role": "system",
                    "content": "You are a legal expert AI that generates clean HTML for contracts."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=2000
        )
        return response.choices[0].message.content
    except Exception as e:
        # Log detailed error information
        logger.error(f"OpenRouter API error: {str(e)}", exc_info=True)
        # Fallback to Django template rendering if API fails
        from django.template import Template, Context
        template = Template(TEMPLATES.get('NDA', '<p>Template not found</p>'))
        context = Context({
            'data': {
                'disclosing_party': 'Company A',
                'receiving_party': 'Company B',
                'purpose': 'Business collaboration',
                'effective_date': '2025-07-02',
                'confidential_info': 'Trade secrets',
                'term': '2 years'
            },
            'created_at': '2025-07-02T17:50:00Z'
        })
        logger.warning("Falling back to default NDA template due to API failure")
        return template.render(context)

async def create_document_embedding(document_text):
    """Create embeddings for document text using qwen/qwen3-14b:free."""
    try:
        client = await get_openai_client()
        response = await client.embeddings.create(
            input=document_text[:8192],  # Truncate for ada-002 limit
            model="qwen/qwen3-14b:free"
        )
        return response.data[0].embedding
    except Exception as e:
        logger.error(f"Error creating embedding: {str(e)}", exc_info=True)
        return f"Error creating embedding: {str(e)}"

async def analyze_contract(contract_text):
    """Analyze contract and provide suggestions."""
    try:
        client = await get_openai_client()
        response = await client.chat.completions.create(
            model="qwen/qwen3-14b:free",
            messages=[
                {
                    "role": "system",
                    "content": "You are a legal expert AI. Review the provided contract and suggest improvements, potential risks, and areas needing clarification."
                },
                {
                    "role": "user",
                    "content": f"Review this contract and suggest improvements:\n\n{contract_text}"
                }
            ],
            max_tokens=1000
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"Error during contract analysis: {str(e)}", exc_info=True)
        return f"Error during contract analysis: {str(e)}"

async def process_contract_embedding(contract_text):
    """Process contract text and get its embedding."""
    embedding = await create_document_embedding(contract_text)
    return embedding

async def generate_contract_summary(contract_text):
    """Generate a summary of the contract."""
    try:
        client = await get_openai_client()
        response = await client.chat.completions.create(
            model="qwen/qwen3-14b:free",
            messages=[
                {
                    "role": "system",
                    "content": "You are a legal expert AI. Provide a concise summary of the contract, highlighting key terms, parties, and obligations."
                },
                {
                    "role": "user",
                    "content": f"Summarize this contract:\n\n{contract_text}"
                }
            ],
            max_tokens=500
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"Error generating summary: {str(e)}", exc_info=True)
        return f"Error generating summary: {str(e)}"

async def extract_contract_terms(contract_text):
    """Extract key terms from the contract."""
    try:
        client = await get_openai_client()
        response = await client.chat.completions.create(
            model="qwen/qwen3-14b:free",
            messages=[
                {
                    "role": "system",
                    "content": "You are a legal expert AI. Extract key terms from the contract including parties, dates, obligations, payment terms, and termination clauses. Return as structured data."
                },
                {
                    "role": "user",
                    "content": f"Extract key terms from this contract:\n\n{contract_text}"
                }
            ],
            max_tokens=800
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"Error extracting terms: {str(e)}", exc_info=True)
        return f"Error extracting terms: {str(e)}"
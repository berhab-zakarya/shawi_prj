import openai
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

# إعداد عميل OpenAI
client = openai.AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=settings.OPENROUTER_API_KEY
)

async def generate_html_for_contract(html_template: str, context: dict, additional_instruction: str = "") -> str:
    if not html_template or not html_template.strip():
        raise ValueError("HTML template cannot be empty")

    try:
        prompt = f"""
You are an expert in HTML refinement.

Task:
Perform the following operation on the provided HTML content:
- {additional_instruction}

Important Instructions:
- ONLY return the full HTML code.
- DO NOT include explanations, notes, or markdown (no ```html).
- Your output MUST start with <!DOCTYPE html> and end with </html>.
- DO NOT change or remove HTML tags unless required by the instruction.
- DO NOT add any extra content.
- Keep the HTML valid, clean, and production-ready.

Here is the HTML content:
{html_template}
"""

        response = await client.chat.completions.create(
            model="qwen/qwen3-14b:free",
            messages=[
                {
                    "role": "system",
                    "content": "You return only clean, full HTML documents based on instructions. No explanations, no markdown."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=4096,
            temperature=0.2
        )

        message = response.choices[0].message
        html_content = getattr(message, "content", "").strip()

        # إزالة أي Markdown إن وُجد
        for prefix in ['```html', '```']:
            if html_content.startswith(prefix):
                html_content = html_content[len(prefix):]
        if html_content.endswith('```'):
            html_content = html_content[:-3]

        html_content = html_content.strip()

        if not html_content or len(html_content) < 20:
            raise ValueError("Generated HTML content is too short or empty")

        return html_content

    except openai.APIError as e:
        logger.error(f"OpenAI API error: {str(e)}")
        raise ValueError(f"AI service error: {str(e)}")
    except Exception as e:
        logger.error(f"Error generating HTML: {str(e)}")
        raise ValueError(f"Failed to generate HTML: {str(e)}")

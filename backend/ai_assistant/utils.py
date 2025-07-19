from django.conf import settings
from documents.models import Document
from documents.views import DocumentAnalyzeView
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from openai import AsyncOpenAI  # Use async client
import json

async def get_openai_client():
    """Initialize OpenAI client with OpenRouter configuration."""
    return AsyncOpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=settings.OPENROUTER_API_KEY
    )

async def get_document_embedding(document_text):
    """Generate embedding for a document using OpenRouter."""
    try:
        client = await get_openai_client()
        response = await client.embeddings.create(
            input=document_text[:8192],  # Truncate for ada-002 limit
            model="text-embedding-ada-002"
        )
        return response.data[0].embedding
    except Exception as e:
        # Fallback to random vector for demo
        return np.random.rand(1536)

async def get_similar_documents(question, user):
    """Find top 3 similar documents for a question using embeddings."""
    documents = Document.objects.filter(uploaded_by=user)
    if not documents:
        return []
    
    try:
        client = await get_openai_client()
        question_embedding = (await client.embeddings.create(
            input=question,
            model="text-embedding-ada-002"
        )).data[0].embedding
    except Exception as e:
        question_embedding = np.random.rand(1536)  # Fallback
    
    doc_scores = []
    analyzer = DocumentAnalyzeView()
    for doc in documents:
        try:
            doc_text = analyzer.get_file_content(doc)
            doc_embedding = await get_document_embedding(doc_text)
            similarity = cosine_similarity([question_embedding], [doc_embedding])[0][0]
            doc_scores.append((doc, similarity))
        except:
            continue
    
    doc_scores.sort(key=lambda x: x[1], reverse=True)
    return [doc for doc, _ in doc_scores[:3]]

async def analyze_document(document_text):
    """Analyze a document using OpenRouter with Markdown formatting."""
    client = await get_openai_client()
    try:
        completion = await client.chat.completions.create(
            extra_headers={
                "HTTP-Referer": "https://your-site-url.com",
                "X-Title": "Legal Document Analyzer",
            },
            extra_body={},
            model="qwen/qwen3-14b:free",
            messages=[
                {
                    "role": "system",
                    "content": """
أنت مستشار قانوني محترف، ومصمم محتوى مبدع في تقديم التحليلات القانونية بطريقة بصرية جذابة باستخدام Markdown. استعمل عناوين كبيرة (h1)، فرعية (h2، h3)، ونسق المحتوى باستخدام **bold**، *italic*، و`اقتباسات`. استعمل الرموز التعبيرية حسب السياق القانوني إن أمكن. يجب أن يكون النص منسقًا بدقة ليسهل قراءته ونسخه، وبلغة عربية فصحى احترافية. لا تخرج عن إطار القانون، ولا تتحدث عن نفسك.
                    """
                },
                {
                    "role": "user",
                    "content": f"""
يرجى تحليل الوثيقة التالية بدقة واحترافية، مستخدمًا تنسيق **Markdown كامل**، يتضمن:

# ✅ ملخص عام للوثيقة:
- ما طبيعة الوثيقة؟ (عقد، مذكرة، حكم...)
- من هم الأطراف الأساسية؟
- ما الهدف منها؟

## ⚖️ البنود القانونية الجوهرية:
- أهم البنود القانونية الواردة؟
- هل توجد شروط غامضة أو تحتاج تفسيرًا؟
- هل وردت إشارات إلى قوانين معينة أو مواد نظامية؟

## ❗ المخاطر أو الثغرات القانونية:
- هل هناك بنود قد تُستخدم ضد أحد الأطراف؟
- هل يوجد غموض قانوني قد يسبب نزاعًا؟

## 🛡️ التوصيات القانونية:
- هل تُنصح بصياغة بديلة لبعض البنود؟
- ما الإجراءات الاحتياطية القانونية المقترحة؟

---

### 📄 الوثيقة الكاملة:

> ```
{document_text}
> ```

📌 **ملحوظة**: اجعل كل قسم واضحًا بعنوان بارز، ونسّق الفقرات داخل كل محور لجعل التجربة بصرية رائعة وسهلة الفهم.
                    """
                }
            ]
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"# ❗ خطأ في التحليل\n\nتحليل الوثيقة فشل: {str(e)}\n\n[Placeholder - actual OpenRouter integration needed]"


async def generate_qna_answer(question, context=""):
    """Generate Q&A answer using OpenRouter."""
    client = await get_openai_client()
    try:
        completion = await client.chat.completions.create(
            extra_body={},
            model="qwen/qwen3-14b:free",
            messages=[
                {
                    "role": "system",
                    "content": """
أنت مستشار قانوني محترف. أجب على السؤال بوضوح وإيجاز بلغة عربية فصحى، مستخدمًا تنسيق **Markdown** لتحسين القراءة. استخدم عناوين (h2، h3)، قوائم، وتنسيقًا بصريًا (*italic*، **bold**) حسب الحاجة. لا تخرج عن إطار القانون.
                    """
                },
                {
                    "role": "user",
                    "content": f"""
**السؤال**: {question}

{context}

**ملاحظة**: قدم الإجابة بتنسيق Markdown واضح ومنظم.
                    """
                }
            ]
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"## ❗ خطأ\n\nفشل معالجة السؤال: {str(e)}\n\n[Placeholder - actual OpenRouter integration needed]"
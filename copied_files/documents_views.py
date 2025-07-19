from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Document, AIAnalysisResult
from .serializers import DocumentSerializer, AIAnalysisResultSerializer
import hashlib
from openai import OpenAI
from django.conf import settings
import PyPDF2
from docx import Document as DocxDocument
import os
import requests
from django.core.files.base import ContentFile
from urllib.parse import urlparse




class DocumentListCreateView(generics.ListCreateAPIView):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        file_content = None
        if self.request.FILES.get('file'):
            file_content = self.request.FILES['file'].read()
        elif serializer.validated_data.get('file_url'):
            response = requests.get(serializer.validated_data['file_url'])
            response.raise_for_status()
            file_content = response.content
            filename = os.path.basename(urlparse(serializer.validated_data['file_url']).path)
            serializer.validated_data['file'] = ContentFile(file_content, name=filename)
        elif serializer.validated_data.get('file_path'):
            with open(serializer.validated_data['file_path'], 'rb') as f:
                file_content = f.read()
            filename = os.path.basename(serializer.validated_data['file_path'])
            serializer.validated_data['file'] = ContentFile(file_content, name=filename)

        file_hash = hashlib.sha256(file_content).hexdigest()
        serializer.save(uploaded_by=self.request.user, file_hash=file_hash)



class DocumentDetailView(generics.RetrieveAPIView):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]


class DocumentAnalyzeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def extract_text_from_pdf(self, file_path):
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ''
                for page in pdf_reader.pages:
                    text += page.extract_text() or ''
                return text
        except Exception as e:
            raise Exception(f"Error reading PDF: {str(e)}")

    def extract_text_from_docx(self, file_path):
        try:
            doc = DocxDocument(file_path)
            text = ''
            for paragraph in doc.paragraphs:
                text += paragraph.text + '\n'
            return text
        except Exception as e:
            raise Exception(f"Error reading DOCX: {str(e)}")

    def extract_text_from_txt(self, file_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
        except Exception as e:
            raise Exception(f"Error reading TXT: {str(e)}")

    def get_file_content(self, document):
        file_path = document.file.path
        extension = os.path.splitext(file_path)[1].lower()

        if extension == '.pdf':
            return self.extract_text_from_pdf(file_path)
        elif extension == '.docx':
            return self.extract_text_from_docx(file_path)
        elif extension == '.txt':
            return self.extract_text_from_txt(file_path)
        else:
            raise Exception(f"Unsupported file type: {extension}")

    def post(self, request, id):
        try:
            document = Document.objects.get(id=id)
            try:
                # Extract text based on file type
                document_text = self.get_file_content(document)

                # Initialize OpenRouter client
                client = OpenAI(
                    base_url="https://openrouter.ai/api/v1",
                    api_key=settings.OPENROUTER_API_KEY,  # Ensure this is set in settings.py
                )

                # Perform analysis using OpenRouter
                completion = client.chat.completions.create(
                    extra_headers={
                        "HTTP-Referer": "https://your-site-url.com",  # Replace with your site URL
                        "X-Title": "Legal Document Analyzer",  # Replace with your site title
                    },
                    extra_body={},
                    model="qwen/qwen3-14b:free",
                    messages=[
    {
        "role": "system",
        "content": "أنت مستشار قانوني محترف، ومصمم محتوى مبدع في تقديم التحليلات القانونية بطريقة بصرية جذابة باستخدام Markdown. استعمل عناوين كبيرة (h1)، فرعية (h2، h3)، ونسق المحتوى باستخدام **bold**، *italic*، و`اقتباسات`. استعمل الرموز التعبيرية حسب السياق القانوني إن أمكن. يجب أن يكون النص منسقًا بدقة ليسهل قراءته ونسخه، وبلغة عربية فصحى احترافية. لا تخرج عن إطار القانون، ولا تتحدث عن نفسك."
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

                # Extract analysis text from the response
                analysis_text = completion.choices[0].message.content
                # Note: Confidence score is not provided by OpenRouter's response; using placeholder
                confidence_score = 0.95  # Adjust based on your requirements or model output if available

                # Save the analysis result
                analysis = AIAnalysisResult.objects.create(
                    document=document,
                    analysis_text=analysis_text,
                    confidence_score=confidence_score,
                    analysis_type='general'
                )
                serializer = AIAnalysisResultSerializer(analysis)
                return Response(serializer.data)
            except Exception as e:
                return Response({'error': f'Analysis failed: {str(e)}'}, status=400)
        except Document.DoesNotExist:
            return Response({'error': 'Document not found'}, status=404)

class AIAnalysisResultListView(generics.ListAPIView):
    serializer_class = AIAnalysisResultSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return AIAnalysisResult.objects.filter(document__uploaded_by=self.request.user)

class DocumentAnalysisListView(generics.ListAPIView):
    serializer_class = AIAnalysisResultSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        document_id = self.kwargs['id']
        return AIAnalysisResult.objects.filter(document_id=document_id, document__uploaded_by=self.request.user)


#                     messages=[
#     {
#         "role": "system",
#         "content": "أنت مستشار قانوني محترف يتقن فهم وتحليل الوثائق القانونية المكتوبة باللغة العربية. مهمتك هي قراءة الوثيقة المقدمة وتحليلها بدقة ومنهجية."
#     },
#     {
#         "role": "user",
#         "content": f"""
# يرجى تحليل الوثيقة التالية وفقًا للمحاور التالية:

# 1. **ملخص عام للوثيقة:**
#     - ما طبيعة الوثيقة؟ (عقد، مذكرة، حكم، إلخ)
#     - من هم الأطراف الأساسية؟
#     - ما الغرض الرئيسي منها؟

# 2. **البنود القانونية الجوهرية:**
#     - ما أهم النقاط القانونية؟
#     - هل توجد شروط تحتاج إلى تفسير؟
#     - هل هناك إحالات إلى قوانين أو مواد نظامية؟

# 3. **المخاطر أو الثغرات القانونية المحتملة:**
#     - هل يوجد أي بند يُحتمل أن يُستخدم ضد أحد الأطراف؟
#     - هل هناك غموض أو نقص قد يؤدي إلى نزاع مستقبلي؟

# 4. **توصيات قانونية:**
#     - هل يُنصح بإعادة صياغة بعض البنود؟
#     - ما الاحتياطات القانونية التي يجب اتخاذها؟

# 📄 نص الوثيقة الكامل:

# \"\"\"
# {document_text}
# \"\"\"
# """
#     }
# ]
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import AIResponse
from .serializers import AIResponseSerializer, AIQuestionSerializer, AIRatingSerializer
from documents.models import Document
from django.conf import settings
from django.template.loader import render_to_string
from weasyprint import HTML
from django.core.files.base import ContentFile
from .utils import get_similar_documents, generate_qna_answer
from asgiref.sync import sync_to_async
class IsOwnerOrStaff(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user == obj.user or request.user.is_staff

class AIQuestionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = AIQuestionSerializer(data=request.data)
        if serializer.is_valid():
            question = serializer.validated_data['question']
            
            try:
                answer = generate_qna_answer(question, context="")
                
                ai_response = AIResponse.objects.create(
                    user=request.user,
                    question=question,
                    answer=answer
                )
                
                serializer = AIResponseSerializer(ai_response)
                return Response(serializer.data, status=201)
            except Exception as e:
                return Response({'error': f'AI processing failed: {str(e)}'}, status=400)
        return Response(serializer.errors, status=400)
class AIResponseListView(generics.ListAPIView):
    serializer_class = AIResponseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AIResponse.objects.filter(user=self.request.user)

class AIResponseDetailView(generics.RetrieveAPIView):
    queryset = AIResponse.objects.all()
    serializer_class = AIResponseSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrStaff]

class AIResponseRateView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrStaff]

    def post(self, request, id):
            try:
                ai_response = AIResponse.objects.get(id=id)
                if ai_response.user != request.user and not request.user.is_staff:
                    return Response({'error': 'You do not have permission to rate this response'}, status=403)
                
                serializer = AIRatingSerializer(data=request.data)
                if serializer.is_valid():
                    ai_response.rating = serializer.validated_data['rating']
                    try:
                        ai_response.save()
                    except Exception as e:
                        return Response({'error': f'Failed to save rating: {str(e)}'}, status=500)
                    
                    try:
                        html_content = render_to_string('qna_export.html', {'response': ai_response})
                    except Exception as e:
                        return Response({'error': f'Failed to render HTML: {str(e)}'}, status=500)
                    
                    try:
                        pdf_file = HTML(string=html_content).write_pdf()
                    except Exception as e:
                        return Response({'error': f'Failed to generate PDF: {str(e)}'}, status=500)
                    
                    pdf_filename = f"qna_{ai_response.id}.pdf"
                    try:
                        ai_response.pdf_export.save(pdf_filename, ContentFile(pdf_file))
                    except Exception as e:
                        return Response({'error': f'Failed to save PDF: {str(e)}'}, status=500)
                    
                    serializer = AIResponseSerializer(ai_response)
                    return Response(serializer.data)
                return Response(serializer.errors, status=400)
            except AIResponse.DoesNotExist:
                return Response({'error': 'Response not found'}, status=404)
            except Exception as e:
                return Response({'error': f'Unexpected error: {str(e)}'}, status=500)
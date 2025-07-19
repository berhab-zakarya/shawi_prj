from rest_framework import serializers
from .models import AIResponse
from documents.models import Document
from documents.serializers import DocumentSerializer

class AIResponseSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.fullname')
    context_documents = DocumentSerializer(many=True, read_only=True)

    class Meta:
        model = AIResponse
        fields = ['id', 'user', 'question', 'answer', 'created_at', 'rating', 'context_documents', 'pdf_export']

class AIQuestionSerializer(serializers.Serializer):
    question = serializers.CharField(max_length=1000)
    use_context = serializers.BooleanField(default=False)  # Whether to use document context

class AIRatingSerializer(serializers.Serializer):
    rating = serializers.IntegerField(min_value=1, max_value=5)
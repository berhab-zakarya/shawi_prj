# documents/serializers.py
from rest_framework import serializers
from .models import Document, AIAnalysisResult


class AIAnalysisResultSerializer(serializers.ModelSerializer):
    document_id = serializers.PrimaryKeyRelatedField(source='document', read_only=True)
    
    class Meta:
        model = AIAnalysisResult
        fields = ['id', 'document_id', 'analysis_text', 'created_at', 'confidence_score', 'analysis_type']

class DocumentSerializer(serializers.ModelSerializer):
    uploaded_by = serializers.ReadOnlyField(source='uploaded_by.username')
    analyses = AIAnalysisResultSerializer(many=True, read_only=True)  # Include related analyses
    
    class Meta:
        model = Document
        fields = ['id', 'title', 'file', 'file_url', 'file_path', 'document_type', 'uploaded_by', 'uploaded_at', 'analyses']
    
    def validate(self, data):
        # Ensure exactly one of file, file_url, or file_path is provided
        sources = [data.get('file'), data.get('file_url'), data.get('file_path')]
        if sum(1 for source in sources if source) != 1:
            raise serializers.ValidationError("Exactly one of file, file_url, or file_path must be provided.")
        return data

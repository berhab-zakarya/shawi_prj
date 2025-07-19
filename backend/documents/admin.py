from django.contrib import admin
from .models import Document, AIAnalysisResult

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'uploaded_by', 'uploaded_at', 'file_hash')
    list_filter = ('uploaded_at', 'uploaded_by')
    search_fields = ('title', 'file_hash')

@admin.register(AIAnalysisResult)
class AIAnalysisResultAdmin(admin.ModelAdmin):
    list_display = ('document', 'created_at', 'analysis_type', 'confidence_score')
    list_filter = ('created_at', 'analysis_type')
    search_fields = ('analysis_text',)
from django.db import models
from django.contrib.auth import get_user_model
# Create your models here.
User = get_user_model()

class Document(models.Model):
    DOCUMENT_TYPES = (
        ('PDF', 'PDF'),
        ('DOCX', 'DOCX'),
        ('TXT', 'Text'),
    )
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='documents/', null=True, blank=True)
    file_url = models.URLField(max_length=200, null=True, blank=True)
    file_path = models.CharField(max_length=255, null=True, blank=True)
    document_type = models.CharField(max_length=10, choices=DOCUMENT_TYPES)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    file_hash = models.CharField(max_length=64, blank=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return self.title


class AIAnalysisResult(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='analyses')
    analysis_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    confidence_score = models.FloatField(null=True, blank=True)
    analysis_type = models.CharField(max_length=100, default='general')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Analysis for {self.document.title} at {self.created_at}"
    
    
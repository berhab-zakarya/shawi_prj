
# Create your models here.
from django.db import models
from documents.models import Document  # Assumes documents app is installed
from django.contrib.auth import get_user_model
User = get_user_model()
class AIResponse(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_responses')
    question = models.TextField()
    answer = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    rating = models.IntegerField(null=True, blank=True, choices=[(i, i) for i in range(1, 6)])  # 1-5 rating
    context_documents = models.ManyToManyField(Document, blank=True)  # Documents used for context
    embedding = models.JSONField(null=True, blank=True)  # Store embeddings for question (optional)
    pdf_export = models.FileField(upload_to='ai_responses/', null=True, blank=True)  # PDF export of Q&A

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Q: {self.question[:50]}... by {self.user.fullname}"
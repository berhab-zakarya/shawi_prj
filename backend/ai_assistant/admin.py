
# Register your models here.
from django.contrib import admin
from .models import AIResponse

@admin.register(AIResponse)
class AIResponseAdmin(admin.ModelAdmin):
    list_display = ('user', 'question', 'created_at', 'rating')
    list_filter = ('created_at', 'user', 'rating')
    search_fields = ('question', 'answer')

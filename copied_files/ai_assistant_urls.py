from django.urls import path
from . import views

urlpatterns = [
    path('ai-assistant/ask/', views.AIQuestionView.as_view(), name='ai-ask'),
    path('ai-assistant/responses/', views.AIResponseListView.as_view(), name='ai-response-list'),
    path('ai-assistant/responses/<int:pk>/', views.AIResponseDetailView.as_view(), name='ai-response-detail'),
    path('ai-assistant/responses/<int:id>/rate/', views.AIResponseRateView.as_view(), name='ai-response-rate'),
]

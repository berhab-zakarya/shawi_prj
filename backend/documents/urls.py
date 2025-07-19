from django.urls import path
from . import views

urlpatterns = [
    path('', views.DocumentListCreateView.as_view(), name='document-list-create'),
    path('<int:pk>/', views.DocumentDetailView.as_view(), name='document-detail'),
    path('<int:id>/analyze/', views.DocumentAnalyzeView.as_view(), name='document-analyze'),
    path('<int:id>/analyses/', views.DocumentAnalysisListView.as_view(), name='document-analyses'),
    path('analyses/', views.AIAnalysisResultListView.as_view(), name='analysis-list')
]
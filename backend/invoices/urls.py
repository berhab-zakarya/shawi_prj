from django.urls import path
from . import views

app_name = 'invoices'

urlpatterns = [
    # Web views
    # path('', views.invoice_list, name='invoice_list'),
    # path('<str:invoice_number>/', views.invoice_detail, name='invoice_detail'),
path('<str:invoice_number>/download/', views.download_invoice_pdf, name='download_pdf'),
    path('invoices/', views.api_invoice_list, name='api_invoice_list'),
    path('invoices/<str:invoice_number>/', views.api_invoice_detail, name='api_invoice_detail'),
    path('invoices/<str:invoice_number>/status/', views.api_update_invoice_status, name='api_update_invoice_status'),
    path('invoices/<str:invoice_number>/remind/', views.api_send_invoice_reminder, name='api_send_invoice_reminder'),
    path('invoices/create/', views.api_create_invoice, name='api_create_invoice'),
]
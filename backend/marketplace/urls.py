from django.urls import path
from . import views


urlpatterns = [
     path('services/', views.ServiceListView.as_view(), name='service-list'),
     path('services/<int:pk>/', views.ServiceDetailView.as_view(), name='service-detail'),  # Add this
    path('services/create/', views.ServiceCreateView.as_view(), name='service-create'),
    path('services/lawyer/', views.LawyerServicesView.as_view(), name='lawyer-services'),
    path('services/<int:pk>/update/', views.ServiceUpdateView.as_view(), name='service-update'),
    path('services/<int:pk>/delete/', views.ServiceDeleteView.as_view(), name='service-delete'),
    path('requests/create/', views.ServiceRequestCreateView.as_view(), name='request-create'),
    path('requests/client/', views.ClientServiceRequestsView.as_view(), name='client-requests'),
    path('requests/<int:pk>/update/', views.ServiceRequestUpdateView.as_view(), name='request-update'),
    path('requests/<int:pk>/manage/', views.ServiceRequestManageView.as_view(), name='request-manage'),
    path('requests/all/', views.AllServiceRequestsView.as_view(), name='all-requests'),
    path('payments/<int:request_id>/process/', views.PaymentProcessView.as_view(), name='payment-process'),
    path('requests/<int:request_id>/attach/', views.DocumentUploadView.as_view(), name='document-upload'),
    path('requests/<int:request_id>/review/', views.ReviewCreateView.as_view(), name='review-create'),

    # ADMIN
    path('admin/services/', views.AdminServicesView.as_view(), name='admin-services'),
    path('admin/services/create/', views.AdminServiceCreateView.as_view(), name='admin-service-create'),
    path('admin/services/<int:pk>/update/', views.AdminServiceUpdateView.as_view(), name='admin-service-update'),
    path('admin/services/<int:pk>/delete/', views.AdminServiceDeleteView.as_view(), name='admin-service-delete'),
    path('admin/payments/', views.AdminPaymentsView.as_view(), name='admin-payments'),
    path('admin/payments/<int:pk>/update/', views.AdminPaymentUpdateView.as_view(), name='admin-payment-update'),
    path('admin/payments/<int:pk>/delete/', views.AdminPaymentDeleteView.as_view(), name='admin-payment-delete'),
    path('admin/documents/', views.AdminDocumentsView.as_view(), name='admin-documents'),
    path('admin/documents/<int:pk>/update/', views.AdminDocumentUpdateView.as_view(), name='admin-document-update'),
    path('admin/documents/<int:pk>/delete/', views.AdminDocumentDeleteView.as_view(), name='admin-document-delete'),
    path('admin/reviews/', views.AdminReviewsView.as_view(), name='admin-reviews'),
    path('admin/reviews/<int:pk>/update/', views.AdminReviewUpdateView.as_view(), name='admin-review-update'),
    path('admin/reviews/<int:pk>/delete/', views.AdminReviewDeleteView.as_view(), name='admin-review-delete'),
]
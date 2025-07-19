from django.urls import path
from .views import (
    ContractAnalyticsView, ContractAnalyzeView, ContractAssignLawyerView, ContractCreateView, ContractDetailView, ContractEnhanceView, ContractGenerateView,
    ContractSignView, ContractReviewView, ContractExportView, ContractSignaturesView, SignatureVerifyView,
 
)
from .admin_views import (
    AdminContractListView, AdminContractUpdateView, AdminContractDeleteView,
    AdminContractAssignLawyerView, AdminContractStatusView, AdminContractForceSignView,
    AdminContractExportAllView
)

urlpatterns = [
     path('contracts/', ContractCreateView.as_view(), name='contract-create'),
    path('contracts/<int:id>/', ContractDetailView.as_view(), name='contract-detail'),
    path('contracts/<int:id>/generate/', ContractGenerateView.as_view(), name='contract-generate'),
    path('contracts/<int:id>/sign/', ContractSignView.as_view(), name='contract-sign'),
    path('contracts/<int:id>/review/', ContractReviewView.as_view(), name='contract-review'),
    path('contracts/<int:id>/analyze/', ContractAnalyzeView.as_view(), name='contract-analyze'),
    path('contracts/<int:id>/export/', ContractExportView.as_view(), name='contract-export'),
    path('contracts/analytics/', ContractAnalyticsView.as_view(), name='contract-analytics'),
    path('contracts/<int:id>/enhance/', ContractEnhanceView.as_view(), name='contract-enhance'),
    path('contracts/verify/<int:signature_id>/', SignatureVerifyView.as_view(), name='signature-verify'),
    path('contracts/<int:contract_id>/signatures/', ContractSignaturesView.as_view(), name='contract-signatures'),
    path('contracts/<int:id>/assign-lawyer/', ContractAssignLawyerView.as_view(), name='contract-assign-lawyer'),

    # Admin URL's
    path('admin/contracts/', AdminContractListView.as_view(), name='admin-contract-list'),
    path('admin/contracts/<int:id>/update/', AdminContractUpdateView.as_view(), name='admin-contract-update'),
    path('admin/contracts/<int:id>/delete/', AdminContractDeleteView.as_view(), name='admin-contract-delete'),
    path('admin/contracts/<int:id>/assign-lawyer/', AdminContractAssignLawyerView.as_view(), name='admin-contract-assign-lawyer'),
    path('admin/contracts/<int:id>/status/', AdminContractStatusView.as_view(), name='admin-contract-status'),
    path('admin/contracts/<int:id>/force-sign/', AdminContractForceSignView.as_view(), name='admin-contract-force-sign'),
    path('admin/contracts/export-all/', AdminContractExportAllView.as_view(), name='admin-contract-export-all'),
]
# urls.py
from django.urls import path
from .views import AdminAnalyticsView, PasswordResetConfirmView, PasswordResetRequestView, ProfileView, RegisterView, LoginView, UpdateProfileView, UserListView, UserLogoutView, VerifyEmailView
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.permissions import AllowAny
from .views import (
    AdminUserListView,
    AdminUserDetailView,
    AdminUserUpdateView,
    AdminUserDeleteView,
    AdminUserToggleActiveView,
    AdminNotificationCreateView,
    UserNotificationListView,
    UserNotificationMarkReadView
)

auth_path = 'auth/'
admin_path = 'admin/'
urlpatterns = [
    path(f'{auth_path}register/', RegisterView.as_view(), name='register'),
    path(f'{auth_path}login/', LoginView.as_view(), name='login'),
    path(f'{auth_path}profile/', ProfileView.as_view(), name='profile'),
    path(f'{auth_path}profile/update/', UpdateProfileView.as_view(), name='profile-update'),
    path(f'{auth_path}users/', UserListView.as_view(), name='user-list'),
    path(f'{auth_path}token/refresh/', TokenRefreshView.as_view(permission_classes=[AllowAny]), name='token_refresh'),
    path(f'{auth_path}verify-email/', VerifyEmailView.as_view(), name='verify-email'),
    path(f'{auth_path}logout/', UserLogoutView.as_view(), name='logout'),
    path(f'{auth_path}password-reset/', PasswordResetRequestView.as_view(), name='password-reset'),
    path(f'{auth_path}password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('users/', AdminUserListView.as_view(), name='admin-user-list'),

     # Admin User Management
    path(f'{admin_path}users/', AdminUserListView.as_view(), name='admin-user-list'),
    path(f'{admin_path}users/<int:id>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path(f'{admin_path}users/<int:id>/update/', AdminUserUpdateView.as_view(), name='admin-user-update'),
    path(f'{admin_path}users/<int:id>/delete/', AdminUserDeleteView.as_view(), name='admin-user-delete'),
    path(f'{admin_path}users/<int:id>/toggle-active/', AdminUserToggleActiveView.as_view(), name='admin-user-toggle-active'),
    
    # Notification Management
    path(f'{admin_path}notifications/create/', AdminNotificationCreateView.as_view(), name='admin-notification-create'),
    path('notifications/', UserNotificationListView.as_view(), name='user-notification-list'),
    path('notifications/<int:id>/mark-read/', UserNotificationMarkReadView.as_view(), name='user-notification-mark-read'),


    path('admin/analytics/', AdminAnalyticsView.as_view(), name='admin_analytics'),
]
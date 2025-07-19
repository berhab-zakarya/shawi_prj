# notifications/urls.py
from django.urls import path
from .views import (
    NotificationListView, NotificationDetailView,
    UnreadNotificationCountView, mark_notification_read,
    mark_all_read, clear_all
)

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification-list'),
    path('<uuid:pk>/', NotificationDetailView.as_view(), name='notification-detail'),
    path('unread-count/', UnreadNotificationCountView.as_view(), name='unread-count'),
    path('<uuid:pk>/mark-read/', mark_notification_read, name='mark-read'),
    path('mark-all-read/', mark_all_read, name='mark-all-read'),
    path('clear-all/', clear_all, name='clear-all'),
]
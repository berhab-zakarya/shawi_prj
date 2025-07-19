# notifications/views.py
from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from django.utils import timezone
from django.shortcuts import get_object_or_404

from .models import Notification
from .serializers import NotificationSerializer, NotificationMarkReadSerializer

class NotificationListView(generics.ListAPIView):
    """List user's notifications"""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_read', 'notification_type', 'priority']
    search_fields = ['title', 'message']
    ordering_fields = ['created_at', 'priority']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        return Notification.objects.filter(user=user)

class NotificationDetailView(generics.RetrieveDestroyAPIView):
    """Retrieve or delete a notification"""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
    
    def perform_destroy(self, instance):
        # Soft delete instead of hard delete
        instance.delete()

class UnreadNotificationCountView(generics.GenericAPIView):
    """Get count of unread notifications"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        count = Notification.objects.filter(
            user=request.user, 
            is_read=False
        ).count()
        return Response({'count': count})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_notification_read(request, pk):
    """Mark a notification as read"""
    notification = get_object_or_404(Notification, pk=pk, user=request.user)
    notification.is_read = True
    notification.save()
    return Response({'status': 'marked as read'})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_all_read(request):
    """Mark all user notifications as read"""
    updated = Notification.objects.filter(
        user=request.user,
        is_read=False
    ).update(is_read=True)
    
    return Response({'marked_read': updated})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def clear_all(request):
    """Clear all read notifications"""
    deleted, _ = Notification.objects.filter(
        user=request.user,
        is_read=True
    ).delete()
    
    return Response({'deleted': deleted})
# notifications/serializers.py
from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    time_since = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'notification_type', 
            'priority', 'is_read', 'created_at', 'time_since',
            'action_url', 'action_text',
        ]
        read_only_fields = fields
    
    def get_time_since(self, obj):
        return obj.time_since

class NotificationMarkReadSerializer(serializers.Serializer):
    id = serializers.UUIDField()
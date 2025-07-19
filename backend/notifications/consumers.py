# notifications/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

class DashboardConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Extract token from query string
        query_string = self.scope.get('query_string', b'').decode()
        token = None
        for param in query_string.split('&'):
            if param.startswith('token='):
                token = param.split('=')[1]
                break

        if not token:
            await self.close(code=4001)  # Unauthorized
            return

        # Authenticate user with JWT
        try:
            user = await self.authenticate_user(token)
            if not user or user.is_anonymous:
                await self.close(code=4001)  # Unauthorized
                return
            self.user = user
        except (InvalidToken, TokenError):
            await self.close(code=4001)  # Unauthorized
            return

        # Join dashboard group for the user
        self.group_name = f'dashboard_{self.user.id}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        print(f"WebSocket connected for user: {self.user.id}")

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
        print(f"WebSocket disconnected for user: {self.user.id if hasattr(self, 'user') else 'unknown'}")

    async def receive(self, text_data):
        # Handle incoming messages if needed
        pass

    async def case_updated(self, event):
        """Send case update to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'case_updated',
            'case_id': event['case_id'],
            'data': event['data']
        }))

    async def document_uploaded(self, event):
        """Send document upload notification"""
        await self.send(text_data=json.dumps({
            'type': 'document_uploaded',
            'document': event['document']
        }))

    async def notification_received(self, event):
        """Send new notification"""
        await self.send(text_data=json.dumps({
            'type': 'notification_received',
            'notification': event['notification'],
            'unread_count': event['unread_count']
        }))

    async def activity_logged(self, event):
        """Send activity log"""
        await self.send(text_data=json.dumps({
            'type': 'activity_logged',
            'activity': event['activity']
        }))

    @database_sync_to_async
    def authenticate_user(self, token):
        """Authenticate user using JWT token"""
        try:
            jwt_auth = JWTAuthentication()
            validated_token = jwt_auth.get_validated_token(token)
            user = jwt_auth.get_user(validated_token)
            return user
        except (InvalidToken, TokenError):
            return AnonymousUser()

    @database_sync_to_async
    def get_unread_count(self):
        from .models import Notification
        return Notification.objects.filter(user=self.user, is_read=False).count()
    
    
class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if self.scope['user'] == AnonymousUser():
            await self.close()
            return
            
        self.user = self.scope['user']
        self.group_name = f'notifications_{self.user.id}'
        
        # Join notification group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        
        await self.accept()

    async def disconnect(self, close_code):
        # Leave notification group
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def send_notification(self, event):
        """Send notification to WebSocket"""
        await self.send(text_data=json.dumps(event['content']))

    @database_sync_to_async
    def get_unread_count(self):
        from .models import Notification
        return Notification.objects.filter(
            user=self.user, 
            is_read=False
        ).count()
import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from ..exceptions import WebSocketException

User = get_user_model()
logger = logging.getLogger(__name__)

class PresenceConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        self.group_name = 'presence'

        if not self.user.is_authenticated:
            logger.warning(f"Unauthenticated user attempted to connect to presence")
            raise WebSocketException("User not authenticated")

        # Get user profile data asynchronously
        profile_data = await self.get_user_profile_data(self.user)

        # Join presence group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

        # Notify others of user joining
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'user_status',
                'user': {
                    'id': self.user.id,
                    'email': self.user.email,
                    'first_name': self.user.first_name,
                    'last_name': self.user.last_name,
                    'fullname': self.user.fullname,
                    'role': profile_data['role'],
                    'avatar': profile_data['avatar'],
                    'is_active': self.user.is_active,
                },
                'status': 'online'
            }
        )

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            try:
                # Get user profile data asynchronously
                profile_data = await self.get_user_profile_data(self.user)

                await self.channel_layer.group_discard(
                    self.group_name,
                    self.channel_name
                )

                if self.user.is_authenticated:
                    # Notify others of user leaving
                    await self.channel_layer.group_send(
                        self.group_name,
                        {
                            'type': 'user_status',
                            'user': {
                                'id': self.user.id,
                                'email': self.user.email,
                                'first_name': self.user.first_name,
                                'last_name': self.user.last_name,
                                'fullname': self.user.fullname,
                                'role': profile_data['role'],
                                'avatar': profile_data['avatar'],
                                'is_active': self.user.is_active,
                            },
                            'status': 'offline'
                        }
                    )
            except Exception as e:
                logger.error(f"Presence disconnect error for user {self.user.email if hasattr(self.user, 'email') else 'unknown'}: {str(e)}")

    async def user_status(self, event):
        await self.send(text_data=json.dumps({
            'type': 'status',
            'user': event['user'],
            'status': event['status']
        }))

    @database_sync_to_async
    def get_user_profile_data(self, user):
        return {
            'role': user.role.name if user.role else 'Client',
            'avatar': user.avatar.url if user.avatar else None
        }

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.exceptions import PermissionDenied
from .models import ChatThread, Message
from .serializers import MessageSerializer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.thread_id = self.scope['url_route']['kwargs']['thread_id']
        self.thread_group_name = f'chat_{self.thread_id}'

        try:
            # Verify user access
            await self.verify_user_access()

            # Add to group
            await self.channel_layer.group_add(
                self.thread_group_name,
                self.channel_name
            )
            await self.accept()
        except (ObjectDoesNotExist, PermissionDenied) as e:
            await self.close(code=4001, reason=str(e))
        except Exception as e:
            await self.close(code=4000, reason=f"Connection error: {str(e)}")

    async def disconnect(self, close_code):
        try:
            await self.channel_layer.group_discard(
                self.thread_group_name,
                self.channel_name
            )
        except Exception as e:
            print(f"Error during disconnect: {str(e)}")

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message_content = text_data_json.get('content')

            if not message_content:
                await self.send(text_data=json.dumps({
                    'error': 'Message content is required'
                }))
                return

            # Save message to database
            message = await self.create_message(message_content)

            # Broadcast message to group
            await self.channel_layer.group_send(
                self.thread_group_name,
                {
                    'type': 'chat_message',
                    'message': MessageSerializer(message).data
                }
            )
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'error': 'Invalid JSON format'
            }))
        except Exception as e:
            await self.send(text_data=json.dumps({
                'error': f"Failed to process message: {str(e)}"
            }))

    async def chat_message(self, event):
        # Send message to WebSocket
        try:
            await self.send(text_data=json.dumps({
                'message': event['message']
            }))
        except Exception as e:
            await self.send(text_data=json.dumps({
                'error': f"Failed to send message: {str(e)}"
            }))

    @database_sync_to_async
    def verify_user_access(self):
        thread = ChatThread.objects.get(id=self.thread_id)
        service_request = thread.service_request
        user = self.scope['user']
        if not user.is_authenticated:
            raise PermissionDenied("Authentication required")
        if user not in [service_request.client, service_request.lawyer]:
            raise PermissionDenied("You are not authorized to access this chat.")

    @database_sync_to_async
    def create_message(self, content):
        thread = ChatThread.objects.get(id=self.thread_id)
        user = self.scope['user']
        if user not in [thread.service_request.client, thread.service_request.lawyer]:
            raise PermissionDenied("You are not authorized to send messages in this chat.")
        return Message.objects.create(
            thread=thread,
            sender=user,
            content=content
        )
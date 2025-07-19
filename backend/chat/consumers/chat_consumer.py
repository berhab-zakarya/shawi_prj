import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from chat.models.chat_room import ChatRoom
from chat.models.message import Message
from chat.models.reaction import Reaction
from notifications.models import Notification

logger = logging.getLogger(__name__)

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'
        self.user = self.scope['user']

        if not self.user.is_authenticated:
            logger.warning(f"Unauthenticated user attempted to connect to room {self.room_name}")
            await self.close()
            return

        # Verify room exists
        if not await self.room_exists():
            logger.warning(f"Room {self.room_name} does not exist")
            await self.close()
            return

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

        # Send user online status
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'status',
                'user': await self.get_user_profile(self.user),
                'status': 'online'
            }
        )

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            # Send user offline status
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'status',
                    'user': await self.get_user_profile(self.user),
                    'status': 'offline'
                }
            )
            # Leave room group
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')

            if message_type == 'message':
                await self.handle_message(data)
            elif message_type == 'reaction':
                await self.handle_reaction(data)
            elif message_type == 'typing':
                await self.handle_typing(data)
            elif message_type == 'status':
                await self.handle_status(data)
            else:
                logger.warning(f"Unknown message type received: {message_type}")
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'نوع الرسالة غير معروف'
                }))
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON received: {text_data}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'بيانات غير صالحة'
            }))

    async def handle_message(self, data):
        message_content = data.get('message')
        if not message_content:
            logger.warning(f"Empty message received from user {self.user.email}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'الرسالة فارغة'
            }))
            return

        # Save message to database
        message = await self.save_message(
            room_name=self.room_name,
            user=self.user,
            content=message_content
        )
        if not message:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'فشل في إرسال الرسالة'
            }))
            return

        # Broadcast message
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'message',
                'message_id': message.id,
                'room': message.room.id,
                'sender': await self.get_user_profile(self.user),
                'message': message.content,
                'timestamp': message.timestamp.isoformat(),
                'is_edited': message.is_edited,
                'edited_at': message.edited_at.isoformat() if message.edited_at else None,
                'reactions': await self.get_message_reactions(message)
            }
        )

        room = await self.get_room()
        if room:
            participants = await self.get_room_participants(room)
            for participant in participants:
                if participant != self.user:
                    await self.create_notification(
                        user=participant,
                        title=f"رسالة جديدة من {self.user.fullname}",
                        message=message_content[:100],
                        notification_type='new_message',
                        content_object=message,
                        priority='medium',
                        action_url=f"/chat/{self.room_name}/",
                        action_text='عرض الرسالة'
                    )

    async def handle_reaction(self, data):
        message_id = data.get('message_id')
        reaction_type = data.get('reaction_type')
        
        if not message_id or not reaction_type:
            logger.warning(f"Invalid reaction data from user {self.user.email}: message_id={message_id}, reaction_type={reaction_type}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'بيانات رد الفعل غير صالحة'
            }))
            return

        # Check if reaction already exists
        existing_reaction = await self.get_existing_reaction(message_id, self.user, reaction_type)
        if existing_reaction:
            logger.info(f"Duplicate reaction attempt by {self.user.email} on message {message_id}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'رد فعل موجود بالفعل لهذه الرسالة'
            }))
            return

        # Save reaction to database
        reaction = await self.save_reaction(
            message_id=message_id,
            user=self.user,
            reaction_type=reaction_type
        )
        if not reaction:
            logger.error(f"Failed to save reaction for message {message_id} by {self.user.email}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'فشل في إضافة رد الفعل'
            }))
            return

        # Broadcast reaction
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'reaction',
                'message_id': message_id,
                'user': await self.get_user_profile(self.user),
                'reaction_type': reaction_type
            }
        )

        # Create notification for message sender
        message = await self.get_message(message_id)
        if message and message.sender != self.user:
            await self.create_notification(
                user=message.sender,
                title=f"{self.user.fullname} تفاعل مع رسالتك",
                message=f"تفاعل باستخدام {reaction_type}",
                notification_type='reaction_added',
                content_object=message,
                priority='low',
                action_url=f"/chat/{self.room_name}/",
                action_text='عرض الرسالة'
            )

    async def handle_typing(self, data):
        is_typing = data.get('is_typing', False)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'typing',
                'user': await self.get_user_profile(self.user),
                'is_typing': is_typing
            }
        )

    async def handle_status(self, data):
        status = data.get('status')
        if status in ['online', 'offline']:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'status',
                    'user': await self.get_user_profile(self.user),
                    'status': status
                }
            )

    # WebSocket event handlers
    async def message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message_id': event['message_id'],
            'room': event['room'],
            'sender': event['sender'],
            'message': event['message'],
            'timestamp': event['timestamp'],
            'is_edited': event['is_edited'],
            'edited_at': event['edited_at'],
            'reactions': event['reactions']
        }))

    async def reaction(self, event):
        await self.send(text_data=json.dumps({
            'type': 'reaction',
            'message_id': event['message_id'],
            'user': event['user'],
            'reaction_type': event['reaction_type']
        }))

    async def typing(self, event):
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'user': event['user'],
            'is_typing': event['is_typing']
        }))

    async def status(self, event):
        await self.send(text_data=json.dumps({
            'type': 'status',
            'user': event['user'],
            'status': event['status']
        }))

    # Database operations
    @database_sync_to_async
    def room_exists(self):
        try:
            ChatRoom.objects.get(name=self.room_name)
            return True
        except ChatRoom.DoesNotExist:
            return False

    @database_sync_to_async
    def get_existing_reaction(self, message_id, user, reaction_type):
        try:
            return Reaction.objects.filter(
                message_id=message_id,
                user=user,
                reaction_type=reaction_type
            ).first()
        except Exception as e:
            logger.error(f"Error checking existing reaction: {str(e)}")
            return None

    @database_sync_to_async
    def save_reaction(self, message_id, user, reaction_type):
        try:
            return Reaction.objects.create(
                message_id=message_id,
                user=user,
                reaction_type=reaction_type
            )
        except Exception as e:
            logger.error(f"Error saving reaction: {str(e)}")
            return None

    @database_sync_to_async
    def save_message(self, room_name, user, content):
        try:
            room = ChatRoom.objects.get(name=room_name)
            return Message.objects.create(
                room=room,
                sender=user,
                content=content
            )
        except Exception as e:
            logger.error(f"Error saving message: {str(e)}")
            return None

    @database_sync_to_async
    def get_message(self, message_id):
        try:
            return Message.objects.select_related('sender').get(id=message_id)
        except Message.DoesNotExist:
            logger.error(f"Message {message_id} not found")
            return None
        except Exception as e:
            logger.error(f"Error fetching message: {str(e)}")
            return None

    @database_sync_to_async
    def get_room(self):
        try:
            return ChatRoom.objects.get(name=self.room_name)
        except ChatRoom.DoesNotExist:
            logger.error(f"Room {self.room_name} not found")
            return None

    @database_sync_to_async
    def get_room_participants(self, room):
        try:
            return list(room.participants.all())
        except Exception as e:
            logger.error(f"Error fetching room participants: {str(e)}")
            return []

    @database_sync_to_async
    def get_user_profile(self, user):
        try:
            profile = user.profile
            return {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'fullname': user.fullname,
                'role': profile.role if hasattr(profile, 'role') else 'user',
                'avatar': profile.avatar.url if hasattr(profile, 'avatar') and profile.avatar else None,
                'is_active': user.is_active
            }
        except Exception as e:
            logger.error(f"Error fetching user profile: {str(e)}")
            return {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'fullname': user.fullname,
                'role': 'user',
                'avatar': None,
                'is_active': user.is_active
            }

    @database_sync_to_async
    def get_message_reactions(self, message):
        try:
            reactions = message.reactions.all()
            return [{
                'id': reaction.id,
                'message': reaction.message_id,
                'user': {
                    'id': reaction.user.id,
                    'email': reaction.user.email,
                    'first_name': reaction.user.first_name,
                    'last_name': reaction.user.last_name,
                    'fullname': reaction.user.fullname,
                    'role': 'user',
                    'avatar': None,
                    'is_active': reaction.user.is_active
                },
                'reaction_type': reaction.reaction_type,
                'created_at': reaction.created_at.isoformat()
            } for reaction in reactions]
        except Exception as e:
            logger.error(f"Error fetching message reactions: {str(e)}")
            return []

    @database_sync_to_async
    def create_notification(self, user, title, message, notification_type, content_object, priority, action_url, action_text):
        try:
            Notification.objects.create(
                user=user,
                title=title,
                message=message,
                notification_type=notification_type,
                content_object=content_object,
                priority=priority,
                action_url=action_url,
                action_text=action_text
            )
        except Exception as e:
            logger.error(f"Error creating notification: {str(e)}")
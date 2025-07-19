from datetime import timezone

from django.conf import settings
from ..models.message import Message
from ..models.chat_room import ChatRoom
from ..exceptions import ChatRoomException
from .notification_service import send_user_notification
from django.utils import timezone

class MessageService:
    @staticmethod
    def create_message(room_name, sender, content, file_url=None):
        try:
            room = ChatRoom.objects.get(name=room_name, is_active=True)
            if not room.participants.filter(id=sender.id).exists():
                raise ChatRoomException(detail="User is not a participant in this room")
            
            message = Message.objects.create(
                room=room,
                sender=sender,
                content=content,
                file=file_url
            )
            # Send notification to other participants
            for participant in room.participants.exclude(id=sender.id):
                role_slug = participant.role.name.lower() if participant.role else 'guest'
                send_user_notification(
                    user=participant,
                    title=f"New Message in {room.name}",
                    message=f"{sender.username}: {content[:50]}...",
                    notification_type='message_received',
                    content_object=message,
                    priority='medium',
                    action_url=f"{settings.FRONTEND_URL}/dashboard/{role_slug}/{room.name}",
                    action_text="View Message"
                )
            return message
        except ChatRoom.DoesNotExist:
            raise ChatRoomException(detail="Chat room does not exist")

    @staticmethod
    def mark_message_read(message_id, user):
        try:
            message = Message.objects.get(id=message_id)
            if message.room.participants.filter(id=user.id).exists():
                message.is_read = True
                message.save()
                return True
            raise ChatRoomException(detail="User not authorized to mark this message")
        except Message.DoesNotExist:
            raise ChatRoomException(detail="Message does not exist")

    @staticmethod
    def edit_message(message_id, user, new_content):
        try:
            message = Message.objects.get(id=message_id, sender=user)
            message.content = new_content
            message.is_edited = True
            message.edited_at = timezone.now()
            message.save()
            # Send notificatext="View Message"
                
            return message
        except Message.DoesNotExist:
            raise ChatRoomException(detail="Message does not exist or not authorized")
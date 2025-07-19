from rest_framework import serializers
from ..models.chat_room import ChatRoom
from ..models.message import Message
from ..models.reaction import Reaction
from ..models.notification import Notification
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    role = serializers.SlugRelatedField(slug_field='name', read_only=True)
    avatar = serializers.SerializerMethodField()
    fullname = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'fullname', 'role', 'avatar', 'is_active']
    
    def get_avatar(self, obj):
        return obj.avatar.url if obj.avatar else None
    
class ChatRoomSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    
    class Meta:
        model = ChatRoom
        fields = ['id', 'name', 'room_type', 'participants', 'created_at', 'is_active']

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    file_url = serializers.SerializerMethodField()
    reactions = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = ['id', 'room', 'sender', 'content', 'file_url', 'timestamp', 'is_read', 'is_edited', 'edited_at', 'reactions']

    def get_file_url(self, obj):
        return obj.file.url if obj.file else None
    
    def get_reactions(self, obj):
        reactions = Reaction.objects.filter(message=obj)
        return ReactionSerializer(reactions, many=True).data

class ReactionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Reaction
        fields = ['id', 'message', 'user', 'reaction_type', 'created_at']


class CreateRoomSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    room_type = serializers.ChoiceField(choices=ChatRoom.ROOM_TYPES, default='ONE_TO_ONE')
    participants = serializers.ListField(child=serializers.CharField())

class SendMessageSerializer(serializers.Serializer):
    room_name = serializers.CharField(max_length=100)
    content = serializers.CharField(allow_blank=True)
    file_url = serializers.URLField(required=False, allow_null=True)

class EditMessageSerializer(serializers.Serializer):
    message_id = serializers.IntegerField()
    new_content = serializers.CharField()

class ReactionSerializerInput(serializers.Serializer):
    message_id = serializers.IntegerField()
    reaction_type = serializers.ChoiceField(choices=Reaction.REACTION_TYPES)


class NotificationSerializer(serializers.ModelSerializer):
    time_since = serializers.SerializerMethodField()
    content_object = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'notification_type', 
            'priority', 'is_read', 'created_at', 'time_since',
            'action_url', 'action_text', 'content_object'
        ]
        read_only_fields = fields
    
    def get_time_since(self, obj):
        return obj.time_since
    
    def get_content_object(self, obj):
        if obj.content_object:
            content_type = obj.content_object._meta.model_name
            if content_type == 'message':
                return MessageSerializer(obj.content_object).data
            elif content_type == 'chatroom':
                return ChatRoomSerializer(obj.content_object).data
        return None

class NotificationMarkReadSerializer(serializers.Serializer):
    id = serializers.UUIDField()
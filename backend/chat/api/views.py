from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, filters
from rest_framework.decorators import api_view, permission_classes
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from django.shortcuts import get_object_or_404
from chat.models.chat_room import ChatRoom
from chat.models.message import Message
from chat.models.reaction import Reaction
from chat.models.notification import Notification
from chat.services.file_service import FileService
from chat.services.message_service import MessageService
from chat.exceptions import ChatRoomException, FileUploadException
from chat.api.serializers import (
    ChatRoomSerializer, MessageSerializer, ReactionSerializer,
    CreateRoomSerializer, SendMessageSerializer, EditMessageSerializer,
    ReactionSerializerInput, NotificationSerializer, NotificationMarkReadSerializer,
    UserSerializer
)
from django.contrib.auth import get_user_model
from rest_framework import permissions
User = get_user_model()

class ActiveUsersList(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['email', 'first_name', 'last_name', 'fullname']
    
    def get_queryset(self):
        return User.objects.filter(is_active=True, is_deleted=False).exclude(id=self.request.user.id)

class ChatRoomListCreate(APIView):
    def get(self, request):
        try:
            rooms = ChatRoom.objects.filter(participants=request.user, is_active=True)
            serializer = ChatRoomSerializer(rooms, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request):
        serializer = CreateRoomSerializer(data=request.data)
        if serializer.is_valid():
            try:
                name = serializer.validated_data['name']
                room_type = serializer.validated_data['room_type']
                participants = serializer.validated_data['participants']
                if ChatRoom.objects.filter(name=name).exists():
                    return Response({'error': 'اسم الغرفة مستخدم مسبقًا.'}, status=status.HTTP_400_BAD_REQUEST)
                room = ChatRoom.objects.create(name=name, room_type=room_type)
                room.participants.add(request.user)
                for email in participants:
                    user = User.objects.get(email=email)
                    room.participants.add(user)
                
                serializer = ChatRoomSerializer(room)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserChatRooms(APIView):
    def get(self, request):
        try:
            rooms = ChatRoom.objects.filter(participants=request.user, is_active=True)
            serializer = ChatRoomSerializer(rooms, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class MessageHistory(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    ordering_fields = ['timestamp']
    ordering = ['timestamp']
    
    def get_queryset(self):
        room_name = self.kwargs['room_name']
        try:
            room = ChatRoom.objects.get(name=room_name, is_active=True)
            if not room.participants.filter(id=self.request.user.id).exists():
                raise ChatRoomException(detail="User not in room")
            return Message.objects.filter(room=room)
        except ChatRoom.DoesNotExist:
            raise ChatRoomException(detail="Room not found")

class FileUpload(APIView):
    def post(self, request):
        try:
            file = request.FILES.get('file')
            room_name = request.data.get('room_name')
            room = ChatRoom.objects.get(name=room_name, is_active=True)
            if not room.participants.filter(id=request.user.id).exists():
                raise ChatRoomException(detail="User not in room")
            FileService.validate_file(file)
            file_url = FileService.save_file(file, request.user, room)
            return Response({'file_url': file_url}, status=status.HTTP_201_CREATED)
        except ChatRoom.DoesNotExist:
            return Response({'error': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)
        except (FileUploadException, ChatRoomException) as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class MessageEdit(APIView):
    def put(self, request):
        serializer = EditMessageSerializer(data=request.data)
        if serializer.is_valid():
            try:
                message = MessageService.edit_message(
                    message_id=serializer.validated_data['message_id'],
                    user=request.user,
                    new_content=serializer.validated_data['new_content']
                )
                return Response(MessageSerializer(message).data, status=status.HTTP_200_OK)
            except ChatRoomException as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MessageRead(APIView):
    def post(self, request, message_id):
        try:
            MessageService.mark_message_read(message_id, request.user)
            return Response({'status': 'Message marked as read'}, status=status.HTTP_200_OK)
        except ChatRoomException as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ReactionAdd(APIView):
    def post(self, request):
        serializer = ReactionSerializerInput(data=request.data)
        if serializer.is_valid():
            try:
                reaction = Reaction.objects.create(
                    message_id=serializer.validated_data['message_id'],
                    user=request.user,
                    reaction_type=serializer.validated_data['reaction_type']
                )
                return Response(ReactionSerializer(reaction).data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_read', 'notification_type', 'priority']
    search_fields = ['title', 'message']
    ordering_fields = ['created_at', 'priority']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

class NotificationDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
    
    def perform_destroy(self, instance):
        instance.delete()

class UnreadNotificationCountView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({'count': count})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_notification_read(request, pk):
    notification = get_object_or_404(Notification, pk=pk, user=request.user)
    notification.is_read = True
    notification.save()
    return Response({'status': 'marked as read'})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_all_read(request):
    updated = Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return Response({'marked_read': updated})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def clear_all(request):
    deleted, _ = Notification.objects.filter(user=request.user, is_read=True).delete()
    return Response({'deleted': deleted})
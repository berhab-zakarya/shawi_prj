from django.urls import path
from chat.api import views

app_name = 'chat'

urlpatterns = [
    # Chat Room Management
    path('rooms/', views.ChatRoomListCreate.as_view(), name='room-list-create'),
    path('rooms/user/', views.UserChatRooms.as_view(), name='user-rooms'),
    
    # Messages
    path('messages/history/<str:room_name>/', views.MessageHistory.as_view(), name='message-history'),
    path('message/edit/', views.MessageEdit.as_view(), name='message-edit'),
    path('message/read/<int:message_id>/', views.MessageRead.as_view(), name='message-read'),
    
    # File Upload
    path('upload/', views.FileUpload.as_view(), name='file-upload'),
    
    # Reactions
    path('reaction/add/', views.ReactionAdd.as_view(), name='reaction-add'),
    
    # User Management
    path('users/active/', views.ActiveUsersList.as_view(), name='active-users'),
]
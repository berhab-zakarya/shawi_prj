from django.urls import re_path
from .consumers import chat_consumer, presence_consumer, notification_consumer

websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<room_name>\w+)/$', chat_consumer.ChatConsumer.as_asgi()),
    re_path(r'ws/presence/$', presence_consumer.PresenceConsumer.as_asgi()),
    re_path(r'ws/notifications/$', notification_consumer.NotificationConsumer.as_asgi()),
]
import os
import django
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'elshawi_backend.settings')
django.setup()

from ai_assistant.routing import websocket_urlpatterns as ai_assistant_ws
from chat.routing import websocket_urlpatterns as chat_ws
from .middleware import TokenAuthMiddleware

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AllowedHostsOriginValidator(
        TokenAuthMiddleware(
            URLRouter(ai_assistant_ws + chat_ws)
        )
    ),
})

# import os
# import django
# from channels.routing import ProtocolTypeRouter, URLRouter
# from channels.security.websocket import AllowedHostsOriginValidator
# from django.core.asgi import get_asgi_application
# from django.urls import path

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'elshawi_backend.settings')
# django.setup()  
# from notifications.middleware import TokenAuthMiddleware
# from notifications.consumers import DashboardConsumer, NotificationConsumer
# from marketplace.routing import websocket_urlpatterns as marketplace_websocket_urlpatterns
# from ai_assistant.routing import websocket_urlpatterns as ai_assistant_websocket_urlpatterns

# application = ProtocolTypeRouter({
#     'http': get_asgi_application(),
#     'websocket': AllowedHostsOriginValidator(
#         TokenAuthMiddleware(
#             URLRouter([
#                 path('ws/notifications/', NotificationConsumer.as_asgi()),
#                 path('ws/dashboard/', DashboardConsumer.as_asgi()),
#                 *marketplace_websocket_urlpatterns,
#                 *ai_assistant_websocket_urlpatterns,
#             ])
#         )
#     ),
# })

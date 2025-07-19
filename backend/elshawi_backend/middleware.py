from urllib.parse import parse_qs
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework.authtoken.models import Token

User = get_user_model()

@database_sync_to_async
def get_user_from_token(token_string):
    try:
        # Try JWT token first
        try:
            access_token = AccessToken(token_string)
            user = User.objects.get(id=access_token['user_id'])
            return user
        except (InvalidToken, TokenError):
            # Try DRF Token
            try:
                token = Token.objects.get(key=token_string)
                return token.user
            except Token.DoesNotExist:
                return AnonymousUser()
    except Exception:
        return AnonymousUser()

class TokenAuthMiddleware(BaseMiddleware):
    def __init__(self, inner):
        super().__init__(inner)

    async def __call__(self, scope, receive, send):
        try:
            query_params = parse_qs(scope["query_string"].decode())
            token = query_params.get("token", [None])[0]
            
            if token:
                scope["user"] = await get_user_from_token(token)
            else:
                scope["user"] = AnonymousUser()
                
        except Exception:
            scope["user"] = AnonymousUser()
            
        return await super().__call__(scope, receive, send)
# utils.py
from django.core.mail import send_mail
from django.conf import settings
from django.urls import reverse
from rest_framework.response import Response
from rest_framework import status
import jwt
from datetime import datetime, timedelta, timezone
import logging

logger = logging.getLogger(__name__)

def send_verification_email(user):
    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.now(timezone.utc) + timedelta(hours=24),
        'type': 'email_verification'
    }, settings.SECRET_KEY, algorithm='HS256')
    subject = "Verify Your Email"  # Fixed subject
    message = f"Hi {user.email},\n\nPlease verify your email by clicking the link below:\n\n"
    message += f"http://127.0.0.1:8000/api/v1/auth/verify-email/?token={token}\n\n"
    message += "This link is valid for 24 hours.\n\nThank you,\nALGECOM Team"
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        logger.info(f"Verification email sent to: {user.email}")
    except Exception as e:
        logger.error(f"Error sending verification email to {user.email}: {str(e)}")
        return Response(
            {"error": "Failed to send verification email."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

def send_password_reset_email(user):
    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.now(timezone.utc) + timedelta(hours=1),
        'type': 'password_reset'
    }, settings.SECRET_KEY, algorithm='HS256')
    reset_url = "http://127.0.0.1:8000/api/v1/" + reverse('password-reset-confirm') + f'?token={token}'
    subject = "Password Reset Request"
    message = f"Click to reset password: {reset_url}"
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False
        )
        logger.info(f"Password reset email sent to: {user.email}")
    except Exception as e:
        logger.error(f"Error sending password reset email to {user.email}: {str(e)}")
        return Response(
            {"error": "Failed to send password reset email."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
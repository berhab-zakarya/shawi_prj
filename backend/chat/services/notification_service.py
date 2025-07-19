from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.translation import gettext_lazy as _
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from chat.api.serializers import NotificationSerializer
from chat.models.notification import Notification


def send_user_notification(user, title, message, notification_type='system_alert',
                          content_object=None, send_email=True, email_subject=None,
                          email_template='emails/notification.html', priority='medium',
                          action_url=None, action_text=None):
    notification = Notification.create_notification(
        user=user,
        title=title,
        message=message,
        notification_type=notification_type,
        content_object=content_object,
        priority=priority,
        action_url=action_url,
        action_text=action_text
    )
    
    if send_email and user.email:
        context = {
            'user': user,
            'notification': notification,
            'action_url': action_url or settings.FRONTEND_URL,
            'site_name': settings.SITE_NAME
        }
        
        subject = email_subject or title
        html_message = render_to_string(email_template, context)
        text_message = f"{title}\n\n{message}"
        
        if action_url:
            text_message += f"\n\nTake action: {action_url}"
        
        send_mail(
            subject=subject,
            message=text_message,
            html_message=html_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True
        )
    
    channel_layer = get_channel_layer()
    group_name = f'notifications_{user.id}'
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            'type': 'send_notification',
            'content': {
                'type': 'NEW_NOTIFICATION',
                'notification': NotificationSerializer(notification).data,
                'unread_count': Notification.objects.filter(user=user, is_read=False).count()
            }
        }
    )
    return notification
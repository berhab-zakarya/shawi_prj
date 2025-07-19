from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone
import uuid
from django.db import models

User = get_user_model()


class Notification(models.Model):
    """System notification model"""
    NOTIFICATION_TYPES = (
        ('case_created', _('Case Created')),
        ('case_status_changed', _('Case Status Changed')),
        ('document_uploaded', _('Document Uploaded')),
        ('ai_analysis_complete', _('AI Analysis Complete')),
        ('consultation_request', _('Consultation Request')),
        ('contract_signed', _('Contract Signed')),
        ('payment_received', _('Payment Received')),
        ('system_alert', _('System Alert')),
        ('message_received', _('Message Received')),
    )
    
    PRIORITY_LEVELS = (
        ('low', _('Low')),
        ('medium', _('Medium')),
        ('high', _('High')),
        ('urgent', _('Urgent')),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='app_notifications',
        verbose_name=_('Recipient')
    )
    title = models.CharField(_('Title'), max_length=200)
    message = models.TextField(_('Message'))
    notification_type = models.CharField(
        _('Type'),
        max_length=50,
        choices=NOTIFICATION_TYPES,
        default='system_alert'
    )
    priority = models.CharField(
        _('Priority'),
        max_length=10,
        choices=PRIORITY_LEVELS,
        default='medium'
    )
    is_read = models.BooleanField(_('Read'), default=False)
    created_at = models.DateTimeField(_('Created At'), default=timezone.now)
    
    # Generic foreign key to any related object
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='app_notification_content'
    )
    object_id = models.UUIDField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # Action fields
    action_url = models.URLField(_('Action URL'), blank=True, null=True)
    action_text = models.CharField(_('Action Text'), max_length=50, blank=True)
    
    class Meta:
        verbose_name = _('Notification')
        verbose_name_plural = _('Notifications')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['notification_type', 'created_at']),
            models.Index(fields=['content_type', 'object_id']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.user.email}"
    
    def mark_as_read(self):
        self.is_read = True
        self.save()
    
    @classmethod
    def create_notification(cls, user, title, message, notification_type='system_alert',
                           content_object=None, priority='medium', action_url=None, action_text=None):
        """Helper method to create notifications"""
        return cls.objects.create(
            user=user,
            title=title,
            message=message,
            notification_type=notification_type,
            priority=priority,
            content_object=content_object,
            action_url=action_url,
            action_text=action_text
        )
    
    @property
    def time_since(self):
        """Human-readable time since creation"""
        diff = timezone.now() - self.created_at
        
        if diff.days > 0:
            return f"{diff.days} days ago"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
        return "Just now"
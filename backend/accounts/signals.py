from django.db.models.signals import post_save
from django.dispatch import receiver

from accounts.models import User, UserProfile
import logging
logger = logging.getLogger(__name__)
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
    else:
        logger.info(f"User {instance.email} updated")
        print(f"User {instance.email} updated")
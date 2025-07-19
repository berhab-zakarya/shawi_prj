from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Contract, Review, Signature
from django.core.mail import send_mail
from celery import shared_task

@shared_task
def send_notification_email(to_email, subject, message):
    send_mail(subject, message, 'berhab.zakarya.dz@gmail.com', [to_email])

@receiver(post_save, sender=Review)
def notify_review_assigned(sender, instance, created, **kwargs):
    if created and instance.contract.needs_review:
        send_notification_email.delay(
            instance.lawyer.email,
            'New Contract Review Assigned',
            f'You have been assigned to review contract {instance.contract.id}.'
        )

@receiver(post_save, sender=Signature)
def notify_signed(sender, instance, created, **kwargs):
    if created:
        send_notification_email.delay(
            instance.contract.client.email,
            'Contract Signed',
            f'Contract {instance.contract.id} has been signed by {instance.user.username}.'
        )
from django.db import models
from django.contrib.auth import get_user_model
from .message import Message

User = get_user_model()

class Reaction(models.Model):
    REACTION_TYPES = (
        ('LIKE', 'Like'),
        ('HEART', 'Heart'),
        ('SMILE', 'Smile'),
        ('SAD', 'Sad'),
    )
    
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='reactions')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    reaction_type = models.CharField(max_length=20, choices=REACTION_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('message', 'user', 'reaction_type')
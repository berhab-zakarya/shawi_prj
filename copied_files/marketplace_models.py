from django.db import models
from django.contrib.auth import get_user_model
User = get_user_model()

class Service(models.Model):
    title = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=100)
    description = models.TextField()
    lawyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='services')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['title']

class ServiceRequest(models.Model):
    STATUS_CHOICES = (
        ('Rejected', 'Rejected'),
        ('Pending', 'Pending'),
        ('Accepted', 'Accepted'),
        ('Paid', 'Paid'),
        ('In Progress', 'In Progress'),
        ('Delivered', 'Delivered'),
        ('Completed', 'Completed'),
    )

    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='client_requests')
    lawyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lawyer_requests')
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='requests')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.service.title} - {self.client.fullname} to {self.lawyer.fullname}"

    class Meta:
        ordering = ['-created_at']

class ChatThread(models.Model):
    service_request = models.OneToOneField(ServiceRequest, on_delete=models.CASCADE, related_name='chat_thread')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Chat for {self.service_request}"

class Message(models.Model):
    thread = models.ForeignKey(ChatThread, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message by {self.sender.fullname} at {self.timestamp}"

    class Meta:
        ordering = ['timestamp']

class Payment(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Completed', 'Completed'),
        ('Failed', 'Failed'),
    )

    request = models.ForeignKey(ServiceRequest, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment {self.id} for {self.request} - {self.status}"

    class Meta:
        ordering = ['-timestamp']

class Document(models.Model):
    request = models.ForeignKey(ServiceRequest, on_delete=models.CASCADE, related_name='documents')
    file = models.FileField(upload_to='documents/')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Document for {self.request} uploaded by {self.uploaded_by.fullname}"

    class Meta:
        ordering = ['-uploaded_at']

class Review(models.Model):
    request = models.OneToOneField(ServiceRequest, on_delete=models.CASCADE, related_name='review')
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])  # 1 to 5 rating
    comment = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review for {self.request} - {self.rating} stars"

    class Meta:
        ordering = ['-timestamp']
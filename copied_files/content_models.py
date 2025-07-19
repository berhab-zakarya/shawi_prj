from django.db import models
from django_ckeditor_5.fields import CKEditor5Field
from taggit.managers import TaggableManager
from django.utils.text import slugify
from django.core.exceptions import ValidationError
from accounts.models import User, RoleModel

class Post(models.Model):
    CONTENT_TYPES = (
        ('article', 'Article'),
        ('video', 'Video'),
        ('infographic', 'Infographic'),
        ('faq', 'FAQ'),
    )

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=250, unique=True, blank=True)
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPES)
    content = CKEditor5Field(config_name='default')
    media = models.FileField(upload_to='content/%Y/%m/%d/', blank=True, null=True)
    tags = TaggableManager(blank=True)
    meta_title = models.CharField(max_length=200, blank=True)
    meta_description = models.TextField(blank=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    view_count = models.PositiveIntegerField(default=0)
    author = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='posts',
        verbose_name="Author"
    )

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
            original_slug = self.slug
            counter = 1
            while Post.objects.filter(slug=self.slug).exists():
                self.slug = f"{original_slug}-{counter}"
                counter += 1
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    def clean(self):
        if self.content_type in ['video', 'infographic'] and not self.media:
            raise ValidationError(f"Media file is required for {self.content_type} content.")
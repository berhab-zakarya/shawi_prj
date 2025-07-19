from django.db import models
from django.contrib.auth.models import BaseUserManager, PermissionsMixin, AbstractBaseUser
import datetime
from django.utils import timezone as tz
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('first_name', extra_fields.get('first_name', ''))
        extra_fields.setdefault('last_name', extra_fields.get('last_name', ''))
        extra_fields.setdefault('time_zone', 'UTC')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('email_verified', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)


class Role(models.TextChoices):
    ADMIN = 'Admin', 'Admin'
    LAYWER =  'Lawyer', 'Lawyer'
    Client = 'Client', 'Client'


class RoleModel(models.Model):
    name = models.CharField(max_length=20, choices=Role.choices, default=Role.Client)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=tz.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    role = models.ForeignKey(
        RoleModel,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="User Role"
    )
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    email_verified = models.BooleanField(default=False)
    time_zone = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        default="UTC",
        verbose_name="Timezone",
        help_text="e.g., Ensures time-sensitive features align with user's local time."
    )
    date_joined = models.DateTimeField(default=tz.now)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    @property
    def fullname(self):
        """Dynamic property for full name"""
        return f"{self.first_name or ''} {self.last_name or ''}".strip()
    @property
    def username(self):
        return f"{self.first_name or ''}_{self.last_name or ''}"
    def __str__(self):
        return self.email
    

class UserProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )

    # Contact Info
    phone_number = models.CharField(max_length=20, blank=True, null=True, verbose_name="Phone Number")
    address = models.CharField(max_length=255, blank=True, null=True, verbose_name="Address")
    city = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)

    # Personal Info
    date_of_birth = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=10, choices=[('male', 'Male'), ('female', 'Female'), ('other', 'Other')], blank=True, null=True)
    nationality = models.CharField(max_length=100, blank=True, null=True)
    languages = models.CharField(max_length=200, blank=True, null=True, help_text="Comma-separated languages")

    # Professional Info
    occupation = models.CharField(max_length=100, blank=True, null=True)
    company_name = models.CharField(max_length=100, blank=True, null=True)
    education = models.TextField(blank=True, null=True)
    license_number = models.CharField(max_length=100, blank=True, null=True, help_text="For lawyers only")
    bar_association = models.CharField(max_length=100, blank=True, null=True)

    # Social Media (optional)
    linkedin_url = models.URLField(blank=True, null=True)
    twitter_url = models.URLField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)

    # System
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email}'s Profile"



class Adminify(models.Model):
    title = models.CharField(max_length=100)
    message = models.TextField()
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='adminify_notifications',
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_adminify'
    )
    created_at = models.DateTimeField(default=timezone.now)
    read = models.BooleanField(default=False)
    priority = models.CharField(
        max_length=20,
        choices=[
            ('LOW', 'Low'),
            ('MEDIUM', 'Medium'),
            ('HIGH', 'High')
        ],
        default='MEDIUM'
    )

    def __str__(self):
        return f"{self.title} - {self.user.email}"
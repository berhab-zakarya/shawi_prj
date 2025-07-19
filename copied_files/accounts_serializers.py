from rest_framework import serializers
from .models import Adminify, RoleModel, User, UserProfile
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.tokens import AccessToken

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True,required=True,style={'input_type': 'password'},)    
    
    class Meta:
        model = User
        fields = ['email','first_name','last_name', 'password', 'role']
        extra_kwargs={
            'first_name': {'required': True},
            'last_name': {'required': True},
            'role': {'required': True}
        }
    # def validate_password(self, value):
    #     if len(value) < 8:
    #         raise serializers.ValidationError("Password must be at least 8 characters long.")
    #     if not re.search(r'[A-Z]', value):
    #         raise serializers.ValidationError("Password must contain at least one uppercase letter.")
    #     if not re.search(r'[a-z]', value):
    #         raise serializers.ValidationError("Password must contain at least one lowercase letter.")
    #     if not re.search(r'[0-9]', value):
    #         raise serializers.ValidationError("Password must contain at least one digit.")
    #     if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
    #         raise serializers.ValidationError("Password must contain at least one special character.")
    #     return value
    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            password=validated_data['password'],
            role=validated_data['role'],
            is_active=True, is_staff=False, is_superuser=False, email_verified=True
            
        )
        
        return user
    
import logging
logger = logging.getLogger(__name__)
class CustomAccessToken(AccessToken):
    def __init__(self, *args, user=None, **kwargs):
        super().__init__(*args, **kwargs)
        if user:
            self['role'] = user.role.name
# serializers.py (partial, showing LoginSerializer)
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(style={'input_type': 'password'}, required=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            logger.error(f"Login attempted with non-existent email: {email}")
            raise serializers.ValidationError({"email": "No user found with this email."})
        
        user = authenticate(
            request=self.context.get('request'),
            username=email,
            password=password,
            

        )
        if not user:
            logger.error(f"Invalid password for email: {email}")
            raise serializers.ValidationError({"password": "Incorrect password."})
        if not user.is_active:
            logger.warning(f"Inactive user attempted login: {email}")
            raise serializers.ValidationError({"email": "User account is inactive."})
        if not user.email_verified:
            logger.warning(f"Unverified email login attempt: {email}")
            raise serializers.ValidationError({"email": "Email is not verified."})

        refresh = RefreshToken.for_user(user)
        access_token = CustomAccessToken(str(refresh.access_token), user=user)

        
        logger.info(f"User {email} logged in successfully")
        return {
            'user_id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role.name if user.role else None,
            'refresh': str(refresh),
            'access': str(access_token),
        } 

class PasswordResetRequestSerializer(serializers.ModelSerializer):
    email = serializers.EmailField()
import re 
class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
        required=True
    )

    def validate_new_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("Password must contain at least one lowercase letter.")
        if not re.search(r'[0-9]', value):
            raise serializers.ValidationError("Password must contain at least one digit.")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise serializers.ValidationError("Password must contain at least one special character.")
        return value
    

class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField(required=True)



class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            'phone_number', 'address', 'city', 'country', 'date_of_birth', 'gender',
            'nationality', 'languages', 'occupation', 'company_name', 'education',
            'license_number', 'bar_association', 'linkedin_url', 'twitter_url', 'website'
        ]
        extra_kwargs = {
            'phone_number': {'required': False, 'allow_blank': True, 'allow_null': True},
            'address': {'required': False, 'allow_blank': True, 'allow_null': True},
            'city': {'required': False, 'allow_blank': True, 'allow_null': True},
            'country': {'required': False, 'allow_blank': True, 'allow_null': True},
            'date_of_birth': {'required': False, 'allow_null': True},
            'gender': {'required': False, 'allow_blank': True, 'allow_null': True},
            'nationality': {'required': False, 'allow_blank': True, 'allow_null': True},
            'languages': {'required': False, 'allow_blank': True, 'allow_null': True},
            'occupation': {'required': False, 'allow_blank': True, 'allow_null': True},
            'company_name': {'required': False, 'allow_blank': True, 'allow_null': True},
            'education': {'required': False, 'allow_blank': True, 'allow_null': True},
            'license_number': {'required': False, 'allow_blank': True, 'allow_null': True},
            'bar_association': {'required': False, 'allow_blank': True, 'allow_null': True},
            'linkedin_url': {'required': False, 'allow_blank': True, 'allow_null': True},
            'twitter_url': {'required': False, 'allow_blank': True, 'allow_null': True},
            'website': {'required': False, 'allow_blank': True, 'allow_null': True},
        }


class UpdateProfileSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(required=False)
    role = serializers.PrimaryKeyRelatedField(queryset=RoleModel.objects.all(), required=False)
    avatar = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'bio', 'avatar', 'time_zone', 'role', 'profile']
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'bio': {'required': False},
            'time_zone': {'required': False},
        }

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', None)
        role_data = validated_data.pop('role', None)
        
        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Update role if provided
        if role_data:
            instance.role = role_data
            
        # Update profile if data is provided
        if profile_data:
            profile = instance.profile
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()
            
        instance.save()
        return instance
    
class UserListSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='role.name', allow_null=True)
    full_name = serializers.CharField(source='fullname', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'full_name', 'role', 
                 'is_active', 'email_verified', 'date_joined']
        


# Serializers
class AdminifySerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    created_by_email = serializers.CharField(source='created_by.email', read_only=True)

    class Meta:
        model = Adminify
        fields = ['id', 'title', 'message', 'user', 'user_email', 'created_by', 
                 'created_by_email', 'created_at', 'read', 'priority']
        extra_kwargs = {
            'user': {'required': True},
            'title': {'required': True},
            'message': {'required': True},
            'created_by': {'read_only': True}
        }
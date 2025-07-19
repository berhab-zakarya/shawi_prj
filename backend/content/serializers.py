from rest_framework import serializers
from taggit.serializers import TagListSerializerField
from .models import Post
from accounts.models import User

class PostSerializer(serializers.ModelSerializer):
    tags = TagListSerializerField()
    author = serializers.StringRelatedField(read_only=True)
    author_email = serializers.EmailField(source='author.email', read_only=True)

    class Meta:
        model = Post
        fields = [
            'id', 'title', 'slug', 'content_type', 'content', 'media',
            'tags', 'meta_title', 'meta_description', 'is_featured',
            'created_at', 'updated_at', 'view_count', 'author', 'author_email'
        ]





class AdminPostSerializer(serializers.ModelSerializer):
    tags = TagListSerializerField()
    author = serializers.StringRelatedField(read_only=True)
    author_email = serializers.EmailField(source='author.email', read_only=True)
    author_role = serializers.CharField(source='author.role.name', read_only=True)
    last_modified_by = serializers.StringRelatedField(read_only=True, allow_null=True)

    class Meta:
        model = Post
        fields = [
            'id', 'title', 'slug', 'content_type', 'content', 'media',
            'tags', 'meta_title', 'meta_description', 'is_featured',
            'created_at', 'updated_at', 'view_count', 'author', 
            'author_email', 'author_role', 'last_modified_by'
        ]

class AdminUserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='role.name', read_only=True)
    profile = serializers.SerializerMethodField()

    def get_profile(self, obj):
        profile = getattr(obj, 'profile', None)
        if profile:
            return {
                'phone_number': profile.phone_number,
                'address': profile.address,
                'city': profile.city,
                'country': profile.country,
                'occupation': profile.occupation
            }
        return None

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'is_active', 
                 'email_verified', 'date_joined', 'profile']
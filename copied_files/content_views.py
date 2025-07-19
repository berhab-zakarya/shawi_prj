from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.exceptions import (
    APIException, 
    PermissionDenied, 
    NotFound,
    ValidationError
)
from rest_framework.permissions import IsAuthenticated
from .models import Post
from .serializers import AdminPostSerializer, AdminUserSerializer, PostSerializer
from django.db.models import Count
from django.http import HttpResponse, Http404
from django.template.loader import render_to_string
from django.core.exceptions import ObjectDoesNotExist
from accounts.models import RoleModel, Role
import logging
from django.db.models import Q
from django.contrib.auth import get_user_model
logger = logging.getLogger(__name__)
User = get_user_model()
class AdminPermission:
    """Mixin to enforce Admin role permission"""
    def check_admin_permission(self, user):
        if not user.is_authenticated:
            raise PermissionDenied("Authentication required.")
        if not hasattr(user, 'role') or not user.role or user.role.name != Role.ADMIN:
            raise PermissionDenied("Only Admin users can perform this action.")
        
class AdminPostViewSet(viewsets.ModelViewSet, AdminPermission):
    """API endpoints for admin to manage blog posts"""
    queryset = Post.objects.all()
    serializer_class = AdminPostSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['content_type', 'tags__name', 'created_at', 'is_featured']
    lookup_field = 'slug'
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Allow filtering by author and status"""
        queryset = super().get_queryset()
        author_id = self.request.query_params.get('author_id')
        if author_id:
            queryset = queryset.filter(author_id=author_id)
        return queryset

    def perform_create(self, serializer):
        """Ensure only admins can create posts through this endpoint"""
        try:
            self.check_admin_permission(self.request.user)
            serializer.save(author=self.request.user)
        except Exception as e:
            logger.error(f"Admin post creation error: {str(e)}")
            raise ValidationError(f"Failed to create post: {str(e)}")

    def perform_update(self, serializer):
        """Ensure only admins can update posts"""
        try:
            self.check_admin_permission(self.request.user)
            serializer.save()
        except Exception as e:
            logger.error(f"Admin post update error: {str(e)}")
            raise ValidationError(f"Failed to update post: {str(e)}")

    def perform_destroy(self, instance):
        """Ensure only admins can delete posts"""
        try:
            self.check_admin_permission(self.request.user)
            instance.delete()
        except Exception as e:
            logger.error(f"Admin post deletion error: {str(e)}")
            raise ValidationError(f"Failed to delete post: {str(e)}")

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get content statistics for admin dashboard"""
        try:
            self.check_admin_permission(request.user)
            stats = {
                'total_posts': self.queryset.count(),
                'posts_by_type': {
                    content_type[0]: self.queryset.filter(content_type=content_type[0]).count()
                    for content_type in Post.CONTENT_TYPES
                },
                'featured_posts': self.queryset.filter(is_featured=True).count(),
                'posts_by_author': {
                    user.email: self.queryset.filter(author=user).count()
                    for user in User.objects.filter(posts__isnull=False).distinct()
                }
            }
            return Response(stats)
        except Exception as e:
            logger.error(f"Admin stats error: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AdminUserViewSet(viewsets.ModelViewSet, AdminPermission):
    """API endpoints for admin to manage users"""
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['role__name', 'is_active', 'email_verified']

    def perform_create(self, serializer):
        """Ensure only admins can create users"""
        try:
            self.check_admin_permission(self.request.user)
            serializer.save()
        except Exception as e:
            logger.error(f"Admin user creation error: {str(e)}")
            raise ValidationError(f"Failed to create user: {str(e)}")

    def perform_update(self, serializer):
        """Ensure only admins can update users"""
        try:
            self.check_admin_permission(self.request.user)
            serializer.save()
        except Exception as e:
            logger.error(f"Admin user update error: {str(e)}")
            raise ValidationError(f"Failed to update user: {str(e)}")

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle user active status"""
        try:
            self.check_admin_permission(request.user)
            user = self.get_object()
            user.is_active = not user.is_active
            user.save()
            return Response({'is_active': user.is_active})
        except Exception as e:
            logger.error(f"Admin toggle active error: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def content_creators(self, request):
        """Get users who have created content"""
        try:
            self.check_admin_permission(request.user)
            creators = User.objects.filter(
                Q(posts__isnull=False) | Q(role__name=Role.LAYWER)
            ).distinct()
            serializer = self.get_serializer(creators, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Admin content creators error: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class AdminPermission:
    """Mixin to enforce Admin role permission"""
    def check_admin_permission(self, user):
        if not user.is_authenticated:
            raise PermissionDenied("Authentication required.")
        if not hasattr(user, 'role') or not user.role or user.role.name != Role.ADMIN:
            raise PermissionDenied("Only Admin users can perform this action.")
        
        

class ServiceUnavailable(APIException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = 'Service temporarily unavailable, try again later.'
    default_code = 'service_unavailable'

def custom_exception_handler(exc, context):
    """Enhanced exception handler with better error responses"""
    from rest_framework.views import exception_handler
    
    response = exception_handler(exc, context)
    
    if response is not None:
        # Add consistent error structure
        custom_response_data = {
            'error': {
                'status_code': response.status_code,
                'message': response.data.get('detail', str(response.data)),
                'code': getattr(exc, 'default_code', 'error')
            }
        }
        
        # Log the error for debugging
        logger.error(f"API Error: {exc.__class__.__name__} - {str(exc)}")
        
        response.data = custom_response_data
    
    return response

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['content_type', 'tags__name', 'created_at']
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return []

    def _check_user_permissions(self, user, action, instance=None):
        """Centralized permission checking"""
        if not user.is_authenticated:
            raise PermissionDenied(f"Authentication required to {action} a post.")
        
        if not hasattr(user, 'role') or not user.role:
            raise PermissionDenied("User role not assigned.")
        
    def _check_user_permissions(self, user, action, instance=None):
        """Centralized permission checking"""
        if not user.is_authenticated:
            raise PermissionDenied(f"Authentication required to {action} a post.")
        
        if not hasattr(user, 'role') or not user.role:
            raise PermissionDenied("User role not assigned.")
        
        # Use your exact Role choices (keeping LAYWER typo as in your model)
        if user.role.name not in [Role.ADMIN, Role.LAYWER]:
            raise PermissionDenied(f"Only Admins and Lawyers can {action} posts.")
        
        # Check if lawyer is trying to modify someone else's post
        if (instance and user.role.name == Role.LAYWER and 
            hasattr(instance, 'author') and instance.author != user):
            raise PermissionDenied(f"Lawyers can only {action} their own posts.")

    def perform_create(self, serializer):
        try:
            user = self.request.user
            self._check_user_permissions(user, 'create')
            serializer.save(author=user)
        except Exception as e:
            logger.error(f"Error creating post: {str(e)}")
            if isinstance(e, (PermissionDenied, ValidationError)):
                raise
            raise APIException("Failed to create post. Please try again.")

    def perform_update(self, serializer):
        try:
            user = self.request.user
            instance = self.get_object()
            self._check_user_permissions(user, 'update', instance)
            serializer.save()
        except Exception as e:
            logger.error(f"Error updating post: {str(e)}")
            if isinstance(e, (PermissionDenied, ValidationError, NotFound)):
                raise
            raise APIException("Failed to update post. Please try again.")

    def perform_destroy(self, instance):
        try:
            user = self.request.user
            self._check_user_permissions(user, 'delete', instance)
            instance.delete()
        except Exception as e:
            logger.error(f"Error deleting post: {str(e)}")
            if isinstance(e, (PermissionDenied, NotFound)):
                raise
            raise APIException("Failed to delete post. Please try again.")

    def get_object(self):
        """Override to handle object not found gracefully"""
        try:
            return super().get_object()
        except (ObjectDoesNotExist, Http404):
            raise NotFound("Post not found.")

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            
            # Safely increment view count
            try:
                instance.view_count += 1
                instance.save(update_fields=['view_count'])
            except Exception as e:
                logger.warning(f"Failed to increment view count: {str(e)}")
                # Don't fail the request if view count update fails
            
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
            
        except NotFound:
            raise
        except Exception as e:
            logger.error(f"Error retrieving post: {str(e)}")
            raise ServiceUnavailable("Unable to retrieve post at this time.")

    @action(detail=False, methods=['get'])
    def featured(self, request):
        try:
            featured_posts = self.queryset.filter(is_featured=True)
            
            # Handle case where no featured posts exist
            if not featured_posts.exists():
                return Response([], status=status.HTTP_200_OK)
            
            serializer = self.get_serializer(featured_posts, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error retrieving featured posts: {str(e)}")
            raise ServiceUnavailable("Unable to retrieve featured posts at this time.")

    @action(detail=False, methods=['get'])
    def tag_stats(self, request):
        try:
            # For django-taggit, we need to use the through table
            # The correct way is to use taggit's Tag model directly
            from taggit.models import Tag
            
            # Get all tags that are actually used in posts
            used_tags = Tag.objects.filter(
                taggit_taggeditem_items__content_type__model='post'
            ).annotate(
                count=Count('taggit_taggeditem_items')
            ).order_by('-count')
            
            # Convert to the expected format
            stats_list = [
                {'tags__name': tag.name, 'count': tag.count} 
                for tag in used_tags
            ]
            
            if not stats_list:
                return Response([], status=status.HTTP_200_OK)
            
            return Response(stats_list)
            
        except Exception as e:
            logger.error(f"Error retrieving tag stats: {str(e)}")
            # Alternative fallback method
            try:
                from taggit.models import Tag, TaggedItem
                from django.contrib.contenttypes.models import ContentType
                
                # Get the ContentType for Post model
                post_content_type = ContentType.objects.get_for_model(Post)
                
                # Get tag usage stats through TaggedItem
                tag_stats = []
                for tag in Tag.objects.all():
                    count = TaggedItem.objects.filter(
                        tag=tag,
                        content_type=post_content_type
                    ).count()
                    if count > 0:
                        tag_stats.append({'tags__name': tag.name, 'count': count})
                
                # Sort by count descending
                tag_stats.sort(key=lambda x: x['count'], reverse=True)
                return Response(tag_stats)
                
            except Exception as fallback_error:
                logger.error(f"Fallback tag stats error: {str(fallback_error)}")
                raise ServiceUnavailable("Unable to retrieve tag statistics at this time.")

def sitemap(request):
    """Generate XML sitemap"""
    try:
        posts = Post.objects.filter(is_published=True)  # Only published posts
        context = {
            'posts': posts,
            'host': request.get_host(),
            'protocol': 'https' if request.is_secure() else 'http'
        }
        xml = render_to_string('sitemap.xml', context)
        return HttpResponse(xml, content_type='application/xml')
        
    except Exception as e:
        logger.error(f"Error generating sitemap: {str(e)}")
        return HttpResponse(
            '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
            content_type='application/xml',
            status=500
        )

def robots(request):
    """Serve robots.txt file"""
    try:
        # Use a more flexible path approach
        import os
        from django.conf import settings
        
        robots_path = os.path.join(settings.BASE_DIR, 'content', 'robots.txt')
        
        if not os.path.exists(robots_path):
            # Return default robots.txt if file doesn't exist
            default_content = """User-agent: *
Disallow: /admin/
Disallow: /api/
Allow: /
"""
            return HttpResponse(default_content, content_type='text/plain')
        
        with open(robots_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        return HttpResponse(content, content_type='text/plain')
        
    except Exception as e:
        logger.error(f"Error serving robots.txt: {str(e)}")
        # Return a basic robots.txt even if there's an error
        return HttpResponse(
            "User-agent: *\nDisallow: /admin/\n",
            content_type='text/plain',
            status=200  # Don't return 500 for robots.txt
        )
    
    
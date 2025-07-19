from django.contrib import admin
from .models import Post
from accounts.models import Role, RoleModel

class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'content_type', 'is_featured', 'created_at', 'view_count', 'author')
    list_filter = ('content_type', 'is_featured', 'created_at', 'author')
    search_fields = ('title', 'content')
    prepopulated_fields = {'slug': ('title',)}

    def has_add_permission(self, request):
        if not request.user.is_authenticated:
            return False
        if not request.user.role:
            return False
        return request.user.role.name in [Role.ADMIN]

    def has_change_permission(self, request, obj=None):
        if not request.user.is_authenticated:
            return False
        if not request.user.role:
            return False
        return request.user.role.name in [Role.ADMIN, Role.LAYWER]

    def has_delete_permission(self, request, obj=None):
        if not request.user.is_authenticated:
            return False
        if not request.user.role:
            return False
        return request.user.role.name in [Role.ADMIN, Role.LAYWER]

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_authenticated and request.user.role:
            if request.user.role.name == Role.Client:
                return qs.filter(is_featured=True)  # Clients see only featured posts
        return qs

admin.site.register(Post, PostAdmin)
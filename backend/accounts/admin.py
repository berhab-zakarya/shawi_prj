from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import RoleModel, User, UserProfile

class ProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'User Profile'
    extra = 0

class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'get_role', 'fullname', 'is_staff', 'is_active', 'email_verified')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'role')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'time_zone', 'avatar', 'bio')}),
        ('Permissions', {
            'fields': (
                'is_active', 
                'is_staff', 
                'is_superuser', 
                'email_verified', 
                'groups', 
                'user_permissions'
            ),
        }),
        ('Role', {'fields': ('role',)}),
        ('Important Dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email',
                'password1',
                'password2',
                'first_name',
                'last_name',
                'role',
                'is_active',
                'is_staff'
            ),
        }),
    )
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)
    filter_horizontal = ('groups', 'user_permissions',)
    inlines = (ProfileInline,)
    
    def get_role(self, obj):
        return obj.role.name if obj.role else "No Role"
    get_role.short_description = 'Role'
    get_role.admin_order_field = 'role__name'

admin.site.register(User, UserAdmin)
admin.site.register(RoleModel)
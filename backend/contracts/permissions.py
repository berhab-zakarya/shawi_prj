from rest_framework import permissions

class ContractPermissions(permissions.BasePermission):
    def has_permission(self, request, view):
        # Basic check: User must be authenticated and active
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        user = request.user

        # 1. Clients and assigned lawyers: Can view and modify their contracts
        if (user == obj.client or obj.reviews.filter(lawyer=user).exists()) and request.method in ['GET', 'POST']:
            return True

        # 2. Staff: Have full permissions
        if user.is_staff:
            return True

        # 3. Others: No permissions
        return False
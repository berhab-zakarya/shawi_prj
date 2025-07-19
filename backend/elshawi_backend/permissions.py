# core/permissions.py
from rest_framework import permissions
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist

class IsAdminUser(permissions.BasePermission):
    """Allows access only to admin users."""
    message = "Only administrators can perform this action."

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role.name == 'Admin'


class IsLawyerUser(permissions.BasePermission):
    """Allows access only to lawyer users."""
    message = "Only licensed lawyers can perform this action."

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role.name == 'Lawyer'


class IsClientUser(permissions.BasePermission):
    """Allows access only to client users."""
    message = "Only clients can perform this action."

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role.name == 'Client'


class IsCaseParticipant(permissions.BasePermission):
    """Allows access to case participants (client, assigned lawyer, or admin)"""
    message = "You don't have permission to access this case."

    def has_object_permission(self, request, view, obj):
        # Admin has full access
        if request.user.role.name == 'Admin':
            return True
            
        # Case client has access
        if obj.client == request.user:
            return True
            
        # Assigned lawyer has access
        if obj.assigned_lawyer and obj.assigned_lawyer == request.user:
            return True
            
        # Lawyers can access unassigned cases
        if request.user.role.name == 'Lawyer' and obj.assigned_lawyer is None:
            return True
            
        return False


class IsDocumentOwner(permissions.BasePermission):
    """Allows access to document owners and case participants"""
    message = "You don't have permission to access this document."

    def has_object_permission(self, request, view, obj):
        # Admins have full access
        if request.user.role.name == 'Admin':
            return True
            
        case = obj.case
        
        # Document uploader (implied by case ownership)
        if case.client == request.user:
            return True
            
        # Assigned lawyer can access
        if case.assigned_lawyer == request.user:
            return True
            
        return False


class IsNoteOwnerOrParticipant(permissions.BasePermission):
    """Allows access to note authors and case participants"""
    message = "You don't have permission to access this note."

    def has_object_permission(self, request, view, obj):
        # Admins have full access
        if request.user.role.name == 'Admin':
            return True
            
        # Note author can access
        if obj.author == request.user:
            return True
            
        case = obj.case
        
        # Case client can access
        if case.client == request.user:
            return True
            
        # Assigned lawyer can access
        if case.assigned_lawyer == request.user:
            return True
            
        return False


class IsPublicNoteOrParticipant(permissions.BasePermission):
    """Allows access to public notes or private notes for case participants."""
    message = "You don't have permission to view this note."

    def has_object_permission(self, request, view, obj):
        # Public notes are visible to all authenticated users
        if not obj.is_private:
            return True
            
        # Admins can see everything
        if request.user.role.name == 'Admin':
            return True
            
        # Note author can see their own notes
        if obj.author == request.user:
            return True
            
        # Case participants can see private notes
        case = obj.case
        return (case.client == request.user or 
                (case.assigned_lawyer and case.assigned_lawyer == request.user))
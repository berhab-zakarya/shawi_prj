from django.utils.deprecation import MiddlewareMixin

class DisableCSRFForJWT(MiddlewareMixin):
    def process_request(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Bearer '):
            setattr(request, '_dont_enforce_csrf_checks', True)

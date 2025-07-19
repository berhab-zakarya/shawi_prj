from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminPostViewSet, AdminUserViewSet, PostViewSet, sitemap, robots

router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='post')
router.register(r'admin/posts', AdminPostViewSet, basename='admin-post')
router.register(r'admin/users', AdminUserViewSet, basename='admin-user')

urlpatterns = [
    path('', include(router.urls)),
    path('sitemap.xml', sitemap, name='sitemap'),
    path('robots.txt', robots, name='robots'),
]
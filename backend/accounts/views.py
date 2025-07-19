import jwt
from rest_framework import generics
from rest_framework import status as http_status

from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from accounts.models import Adminify, User
from content.models import Post
from contracts.models import Contract, Review
from documents.models import AIAnalysisResult, Document
from invoices.models import Invoice
from marketplace.models import ServiceRequest, Payment, Review as MarketplaceReview
from elshawi_backend.permissions import IsAdminUser
from .serializers import AdminifySerializer, LogoutSerializer, PasswordResetConfirmSerializer, PasswordResetRequestSerializer, RegisterSerializer, LoginSerializer, UpdateProfileSerializer, UserListSerializer, UserProfileSerializer
from rest_framework.views import APIView
from .utils import send_password_reset_email, send_verification_email
from django.conf import settings
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
from django.http import HttpResponse
from rest_framework import status
class RegisterView(APIView):
    
    permission_classes = [AllowAny]
    def post(self,request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            send_verification_email(user)
            return Response(
                {"message": "User registered successfully. Please check your email for verification."},
                status=status.HTTP_201_CREATED
            )
        return Response(
            {"errors": "Invalid data", "details": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )
import logging
logger = logging.getLogger(__name__)  
class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        token = request.GET.get('token')
        if not token:
            logger.error("No token provided for email verification")
            return Response(
                {"error": "Token is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            if payload['type'] != 'email_verification':
                logger.error("Invalid token type for email verification")
                return Response(
                    {"error": "Invalid token type."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user = User.objects.get(id=payload['user_id'])
            if not user.email_verified:
                user.email_verified = True
                user.save()
                logger.info(f"Email verified for user: {user.email}")
                return Response(
                    {"message": "Email verified successfully."},
                    status=status.HTTP_200_OK
                )
            logger.info(f"Email already verified for user: {user.email}")
            return Response(
                {"message": "Email already verified."},
                status=status.HTTP_200_OK
            )
        except jwt.ExpiredSignatureError:
            logger.error("Expired token for email verification")
            return Response(
                {"error": "Token has expired."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except jwt.InvalidTokenError:
            logger.error("Invalid token for email verification")
            return Response(
                {"error": "Invalid token provided."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except User.DoesNotExist:
            logger.error("User not found for email verification")
            return Response(
                {"error": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error during email verification: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ProfileView(APIView):
    permission_classes =   [IsAuthenticated]
    
    def get(post,request):
        # serializer = UserProfileSerializer()
        user = request.user
        data = {
            "user_id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role.name if user.role else None,
            "avatar": user.avatar.url if user.avatar else None,
            "date_joined": user.date_joined.isoformat(),
        }
        
        return Response(data, status=status.HTTP_200_OK)
    
class LoginView(APIView):
    permission_classes=[AllowAny]
    def post(self, request):
        serializer = LoginSerializer(data=request.data,context={'request': request})
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        return Response(data, status=status.HTTP_200_OK)
 
class UserLogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            refresh_token = serializer.validated_data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()
            logger.info(f"User logged out: {request.user.email}")
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except TokenError:
            logger.error("Invalid token during logout")
            return Response(
                {"error": "Invalid token"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    def post(self,request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        try:
            user= User.objects.get(email=email)
            send_password_reset_email(user)
            return Response(
                {"message": "Password reset email sent."},
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            return Response(
                {"error": "User with this email does not exist."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    def post(self,request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            payload = jwt.decode(
                serializer.validated_data['token'],
                settings.SECRET_KEY,
                algorithms=['HS256']
            )
            if payload['type'] != 'password_reset':
                return Response(
                    {"error": "Invalid token type."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user = User.objects.get(id=payload['user_id'])
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            OutstandingToken.objects.filter(user=user).delete()
            return Response(
                {"message": "Password reset successfully."},
                status=status.HTTP_200_OK
            )
        except jwt.ExpiredSignatureError:
            return Response(
                {"error": "Token has expired."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except jwt.InvalidTokenError:
            return Response(
                {"error": "Invalid token."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except User.DoesNotExist:
            return Response(
                {"error": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
class UserListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    queryset = User.objects.filter(is_deleted=False).order_by('-date_joined')
    serializer_class = UserListSerializer      
class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request):
        user = request.user
        serializer = UpdateProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Profile updated for user: {user.email}")
            return Response(
                {"message": "Profile updated successfully.", "data": serializer.data},
                status=status.HTTP_200_OK
            )
        logger.error(f"Profile update failed for user: {user.email}. Errors: {serializer.errors}")
        return Response(
            {"errors": "Invalid data", "details": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )
    

#### FOR ADMIN

class AdminUserListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    queryset = User.objects.filter(is_deleted=False).order_by('-date_joined')
    serializer_class = UserListSerializer

class AdminUserDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = User.objects.filter(is_deleted=False)
    serializer_class = UserListSerializer
    lookup_field = 'id'

class AdminUserUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def put(self, request, id):
        try:
            user = User.objects.get(id=id, is_deleted=False)
            if user.id == request.user.id:
                logger.error(f"Admin {request.user.email} attempted to update their own account")
                return Response(
                    {"error": "Cannot modify your own account"},
                    status=status.HTTP_403_FORBIDDEN
                )
                
            serializer = UpdateProfileSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                logger.info(f"Admin {request.user.email} updated user: {user.email}")
                return Response(
                    {"message": "User updated successfully", "data": serializer.data},
                    status=status.HTTP_200_OK
                )
            logger.error(f"Admin user update failed: {serializer.errors}")
            return Response(
                {"errors": "Invalid data", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        except User.DoesNotExist:
            logger.error(f"Admin {request.user.email} attempted to update non-existent user ID: {id}")
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

class AdminUserDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def delete(self, request, id):
        try:
            user = User.objects.get(id=id, is_deleted=False)
            if user.id == request.user.id:
                logger.error(f"Admin {request.user.email} attempted to delete their own account")
                return Response(
                    {"error": "Cannot delete your own account"},
                    status=status.HTTP_403_FORBIDDEN
                )
            user.is_deleted = True
            user.is_active = False
            user.save()
            logger.info(f"Admin {request.user.email} soft-deleted user: {user.email}")
            return Response(
                {"message": "User deleted successfully"},
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            logger.error(f"Admin {request.user.email} attempted to delete non-existent user ID: {id}")
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

class AdminUserToggleActiveView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def patch(self, request, id):
        try:
            user = User.objects.get(id=id, is_deleted=False)
            if user.id == request.user.id:
                logger.error(f"Admin {request.user.email} attempted to toggle their own account status")
                return Response(
                    {"error": "Cannot modify your own account status"},
                    status=status.HTTP_403_FORBIDDEN
                )
            user.is_active = not user.is_active
            user.save()
            status_message = "activated" if user.is_active else "deactivated"
            logger.info(f"Admin {request.user.email} {status_message} user: {user.email}")
            return Response(
                {"message": f"User {status_message} successfully"},
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            logger.error(f"Admin {request.user.email} attempted to toggle non-existent user ID: {id}")
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

# Notification APIs
class AdminNotificationCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def post(self, request):
        serializer = AdminifySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            logger.info(f"Admin {request.user.email} created notification for user: {serializer.validated_data['user'].email}")
            return Response(
                {"message": "Notification created successfully", "data": serializer.data},
                status=status.HTTP_201_CREATED
            )
        logger.error(f"Notification creation failed: {serializer.errors}")
        return Response(
            {"errors": "Invalid data", "details": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

class UserNotificationListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AdminifySerializer
    
    def get_queryset(self):
        return Adminify.objects.filter(user=self.request.user).order_by('-created_at')

class UserNotificationMarkReadView(APIView):
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, id):
        try:
            notification = Adminify.objects.get(id=id, user=request.user)
            notification.read = True
            notification.save()
            logger.info(f"User {request.user.email} marked notification {id} as read")
            return Response(
                {"message": "Notification marked as read"},
                status=status.HTTP_200_OK
            )
        except Adminify.DoesNotExist:
            logger.error(f"User {request.user.email} attempted to mark non-existent notification {id}")
            return Response(
                {"error": "Notification not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        

from django.db import  models
from django.db.models import Count,Avg, Sum
import csv
from datetime import datetime, timedelta
from taggit.models import Tag
from django.utils import timezone

class AdminAnalyticsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        try:
            # Optional date range filters
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            export_format = request.query_params.get('export')

            # Apply date filters if provided
            date_filter = {}
            if start_date:
                date_filter['created_at__gte'] = datetime.strptime(start_date, '%Y-%m-%d')
            if end_date:
                date_filter['created_at__lte'] = datetime.strptime(end_date, '%Y-%m-%d')

            # User Analytics
            users = User.objects.filter(is_deleted=False)
            if date_filter:
                users = users.filter(**date_filter)
            user_counts = users.aggregate(
                total=Count('id'),
                active=Count('id', filter=models.Q(is_active=True)),
                inactive=Count('id', filter=models.Q(is_active=False))
            )
            users_by_role = users.values('role__name').annotate(count=Count('id'))
            new_users_last_30_days = User.objects.filter(
                date_joined__gte=datetime.now() - timedelta(days=30)
            ).count()

            # Document Analytics
            documents = Document.objects.all()
            if date_filter:
                documents = documents.filter(**date_filter)
            document_counts = documents.aggregate(total=Count('id'))
            documents_by_type = documents.values('document_type').annotate(count=Count('id'))
            analyses = AIAnalysisResult.objects.all()
            if date_filter:
                analyses = analyses.filter(**date_filter)
            analysis_stats = analyses.aggregate(
                total=Count('id'),
                avg_confidence=Avg('confidence_score')
            )

            # Invoice Analytics
            invoices = Invoice.objects.all()
            if date_filter:
                invoices = invoices.filter(**date_filter)
            invoice_counts = invoices.aggregate(total=Count('id'))
            invoices_by_status = invoices.values('status').annotate(count=Count('id'))
            overdue_invoices = invoices.filter(
    due_date__lt=timezone.now().date(),
    status__in=['pending', 'sent']  # adjust statuses as needed
).count()
            total_revenue = invoices.filter(status='paid').aggregate(
                total=Sum('total_amount')
            )['total'] or 0

            # Contract Analytics
            contracts = Contract.objects.all()
            if date_filter:
                contracts = contracts.filter(**date_filter)
            contract_counts = contracts.aggregate(total=Count('id'))
            contracts_by_status = contracts.values('status').annotate(count=Count('id'))
            contracts_by_type = contracts.values('contract_type').annotate(count=Count('id'))
            contract_reviews = Review.objects.filter(status__in=['APPROVED', 'REJECTED'])
            if date_filter:
                contract_reviews = contract_reviews.filter(**date_filter)
            avg_review_time = contract_reviews.aggregate(
                avg_time=Avg(models.F('updated_at') - models.F('created_at'))
            )['avg_time']

            # Marketplace Analytics
            service_requests = ServiceRequest.objects.all()
            if date_filter:
                service_requests = service_requests.filter(**date_filter)
            service_request_counts = service_requests.aggregate(total=Count('id'))
            service_requests_by_status = service_requests.values('status').annotate(count=Count('id'))
            payments = Payment.objects.all()
            if date_filter:
                payments = payments.filter(**date_filter)
            payment_stats = payments.aggregate(
                total=Count('id'),
                total_amount=Sum('amount', filter=models.Q(status='Completed'))
            )
            review_stats = MarketplaceReview.objects.all()
            if date_filter:
                review_stats = review_stats.filter(**date_filter)
            avg_review_rating = review_stats.aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0

            # Content Analytics
            posts = Post.objects.all()
            if date_filter:
                posts = posts.filter(**date_filter)
            post_counts = posts.aggregate(total=Count('id'))
            posts_by_type = posts.values('content_type').annotate(count=Count('id'))
            featured_posts = posts.filter(is_featured=True).count()
            total_views = posts.aggregate(total_views=Sum('view_count'))['total_views'] or 0
            tag_stats = Tag.objects.filter(
                taggit_taggeditem_items__content_type__model='post'
            ).annotate(count=Count('taggit_taggeditem_items')).order_by('-count')[:5]

            # Notification Analytics (using Adminify model)
            notifications = Adminify.objects.all()
            if date_filter:
                notifications = notifications.filter(**date_filter)
            notification_counts = notifications.aggregate(total=Count('id'))
            notifications_by_priority = notifications.values('priority').annotate(count=Count('id'))
            unread_notifications = notifications.filter(read=False).count()

            # Prepare response data
            analytics_data = {
                'users': {
                    'total': user_counts['total'],
                    'by_role': {item['role__name'] or 'No Role': item['count'] for item in users_by_role},
                    'new_users_last_30_days': new_users_last_30_days,
                    'active_users': user_counts['active'],
                    'inactive_users': user_counts['inactive']
                },
                'documents': {
                    'total': document_counts['total'],
                    'by_type': {item['document_type']: item['count'] for item in documents_by_type},
                    'analyses_performed': analysis_stats['total'],
                    'avg_confidence_score': round(analysis_stats['avg_confidence'] or 0, 2)
                },
                'invoices': {
                    'total': invoice_counts['total'],
                    'by_status': {item['status']: item['count'] for item in invoices_by_status},
                    'overdue': overdue_invoices,
                    'total_revenue': float(total_revenue)
                },
                'contracts': {
                    'total': contract_counts['total'],
                    'by_status': {item['status']: item['count'] for item in contracts_by_status},
                    'by_type': {item['contract_type']: item['count'] for item in contracts_by_type},
                    'avg_review_time_days': round(avg_review_time.total_seconds() / 86400, 2) if avg_review_time else 0
                },
                'marketplace': {
                    'service_requests': {
                        'total': service_request_counts['total'],
                        'by_status': {item['status']: item['count'] for item in service_requests_by_status}
                    },
                    'payments': {
                        'total': payment_stats['total'],
                        'total_revenue': float(payment_stats['total_amount'] or 0)
                    },
                    'avg_review_rating': round(avg_review_rating, 2)
                },
                'content': {
                    'total_posts': post_counts['total'],
                    'by_content_type': {item['content_type']: item['count'] for item in posts_by_type},
                    'featured_posts': featured_posts,
                    'total_views': total_views,
                    'top_tags': [{'name': tag.name, 'count': tag.count} for tag in tag_stats]
                },
                'notifications': {
                    'total': notification_counts['total'],
                    'by_priority': {item['priority']: item['count'] for item in notifications_by_priority},
                    'unread': unread_notifications
                }
            }

            # Handle CSV export
            if export_format == 'csv':
                response = HttpResponse(content_type='text/csv')
                response['Content-Disposition'] = f'attachment; filename="admin_analytics_{datetime.now().strftime("%Y%m%d")}.csv"'
                writer = csv.writer(response)
                writer.writerow(['Category', 'Metric', 'Value'])

                # Write user metrics
                writer.writerow(['Users', 'Total', analytics_data['users']['total']])
                for role, count in analytics_data['users']['by_role'].items():
                    writer.writerow(['Users', f'Role: {role}', count])
                writer.writerow(['Users', 'New (Last 30 Days)', analytics_data['users']['new_users_last_30_days']])
                writer.writerow(['Users', 'Active', analytics_data['users']['active_users']])
                writer.writerow(['Users', 'Inactive', analytics_data['users']['inactive_users']])

                # Write document metrics
                writer.writerow(['Documents', 'Total', analytics_data['documents']['total']])
                for doc_type, count in analytics_data['documents']['by_type'].items():
                    writer.writerow(['Documents', f'Type: {doc_type}', count])
                writer.writerow(['Documents', 'Analyses Performed', analytics_data['documents']['analyses_performed']])
                writer.writerow(['Documents', 'Avg Confidence Score', analytics_data['documents']['avg_confidence_score']])

                # Write invoice metrics
                writer.writerow(['Invoices', 'Total', analytics_data['invoices']['total']])
                for status, count in analytics_data['invoices']['by_status'].items():
                    writer.writerow(['Invoices', f'Status: {status}', count])
                writer.writerow(['Invoices', 'Overdue', analytics_data['invoices']['overdue']])
                writer.writerow(['Invoices', 'Total Revenue', analytics_data['invoices']['total_revenue']])

                # Write contract metrics
                writer.writerow(['Contracts', 'Total', analytics_data['contracts']['total']])
                for status, count in analytics_data['contracts']['by_status'].items():
                    writer.writerow(['Contracts', f'Status: {status}', count])
                for contract_type, count in analytics_data['contracts']['by_type'].items():
                    writer.writerow(['Contracts', f'Type: {contract_type}', count])
                writer.writerow(['Contracts', 'Avg Review Time (Days)', analytics_data['contracts']['avg_review_time_days']])

                # Write marketplace metrics
                writer.writerow(['Marketplace', 'Total Service Requests', analytics_data['marketplace']['service_requests']['total']])
                for status, count in analytics_data['marketplace']['service_requests']['by_status'].items():
                    writer.writerow(['Marketplace', f'Service Request Status: {status}', count])
                writer.writerow(['Marketplace', 'Total Payments', analytics_data['marketplace']['payments']['total']])
                writer.writerow(['Marketplace', 'Payment Revenue', analytics_data['marketplace']['payments']['total_revenue']])
                writer.writerow(['Marketplace', 'Avg Review Rating', analytics_data['marketplace']['avg_review_rating']])

                # Write content metrics
                writer.writerow(['Content', 'Total Posts', analytics_data['content']['total_posts']])
                for content_type, count in analytics_data['content']['by_content_type'].items():
                    writer.writerow(['Content', f'Content Type: {content_type}', count])
                writer.writerow(['Content', 'Featured Posts', analytics_data['content']['featured_posts']])
                writer.writerow(['Content', 'Total Views', analytics_data['content']['total_views']])
                for tag in analytics_data['content']['top_tags']:
                    writer.writerow(['Content', f'Tag: {tag["name"]}', tag['count']])

                # Write notification metrics
                writer.writerow(['Notifications', 'Total', analytics_data['notifications']['total']])
                for priority, count in analytics_data['notifications']['by_priority'].items():
                    writer.writerow(['Notifications', f'Priority: {priority}', count])
                writer.writerow(['Notifications', 'Unread', analytics_data['notifications']['unread']])

                return response

            return Response(analytics_data, status=http_status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"AdminAnalyticsView error: {str(e)}")
            return Response({'error': f'Failed to retrieve analytics: {str(e)}'}, status=http_status.HTTP_500_INTERNAL_SERVER_ERROR)
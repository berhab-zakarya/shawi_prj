from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Service, ServiceRequest, ChatThread, Message, Payment, Document, Review
User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    fullname = serializers.CharField(read_only=True)
    role = serializers.CharField(source='role.name', read_only=True)
    phone_number = serializers.CharField(source='profile.phone_number', read_only=True, allow_null=True)
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'fullname', 'role', 'bio', 'avatar', 'avatar_url', 'time_zone', 'date_joined', 'phone_number']

    def get_avatar_url(self, obj):
        request = self.context.get('request')
        if obj.avatar and hasattr(obj.avatar, 'url'):
            return request.build_absolute_uri(obj.avatar.url) if request else obj.avatar.url
        return None
    
   
class ReviewSerializer(serializers.ModelSerializer):
    client_fullname = serializers.CharField(source='request.client.fullname', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'request', 'rating', 'comment', 'client_fullname', 'timestamp']
        read_only_fields = ['request', 'timestamp']

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value


class DocumentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    uploaded_by_fullname = serializers.CharField(source='uploaded_by.fullname', read_only=True)

    class Meta:
        model = Document
        fields = ['id', 'request', 'file', 'file_url', 'uploaded_by', 'uploaded_by_fullname', 'uploaded_at']
        read_only_fields = ['uploaded_by', 'uploaded_at']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None

class ServiceSerializer(serializers.ModelSerializer):
    lawyer = UserSerializer(read_only=True)
    lawyer_fullname = serializers.CharField(source='lawyer.fullname', read_only=True)
    requests = serializers.SerializerMethodField()
    price = serializers.CharField()
    
    class Meta:
        model = Service
        fields = ['id', 'title', 'price', 'category', 'description', 'lawyer', 'lawyer_fullname', 'created_at', 'updated_at', 'requests']

    def get_requests(self, obj):
        requests = ServiceRequest.objects.filter(service=obj).select_related('client', 'client__profile', 'lawyer', 'lawyer__profile').prefetch_related('documents', 'review')
        return ServiceRequestSerializer(requests, many=True, context=self.context).data
    
 
class ServiceRequestSerializer(serializers.ModelSerializer):
    client = UserSerializer(read_only=True)
    lawyer = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(role__name='Lawyer'))
    service = serializers.PrimaryKeyRelatedField(queryset=Service.objects.all())
    documents = DocumentSerializer(many=True, read_only=True)
    review = ReviewSerializer(read_only=True, allow_null=True)

    class Meta:
        model = ServiceRequest
        fields = [
            'id', 'client', 'lawyer', 'service',
            'status', 'created_at', 'updated_at',
            'documents', 'review'
        ]
        read_only_fields = ['client', 'created_at', 'updated_at']

    def validate(self, data):
        """
        Ensure the provided lawyer matches the service's lawyer and
        prevent duplicate pending requests for the same service by the client.
        """
        service = data.get('service')
        lawyer = data.get('lawyer')
        client = self.context['request'].user

        # Check if lawyer matches the service's lawyer
        if lawyer != service.lawyer:
            logger.error(f"Lawyer mismatch: provided lawyer={lawyer.id}, service lawyer={service.lawyer.id}")
            raise serializers.ValidationError(
                "The provided lawyer does not match the lawyer associated with the service."
            )

        # Check for existing pending request
        existing_request = ServiceRequest.objects.filter(
            client=client,
            service=service,
            status='Pending'
        ).first()
        if existing_request:
            logger.debug(f"Found existing pending request: id={existing_request.id}, client={client.id}, service={service.id}, status={existing_request.status}")
            raise serializers.ValidationError(
                "You already have a pending request for this service."
            )

        logger.debug(f"No pending request found for client={client.id}, service={service.id}")
        return data

    def create(self, validated_data):
        validated_data['client'] = self.context['request'].user
        return super().create(validated_data)


class ServiceRequestStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceRequest
        fields = ['status']

    def validate_status(self, value):
        if value not in ['Accepted', 'Rejected', 'Completed']:
            raise serializers.ValidationError("Invalid status.")
        return value
    
import logging
logger = logging.getLogger(__name__)

class SimpleServiceSerializer(serializers.ModelSerializer):
    lawyer = UserSerializer(read_only=True)
    lawyer_fullname = serializers.CharField(source='lawyer.fullname', read_only=True)
    price = serializers.CharField()
    request_status = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = ['id', 'title', 'price', 'category', 'description', 'lawyer', 'lawyer_fullname', 'created_at', 'updated_at', 'request_status']

    def get_request_status(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        if not user or not user.is_authenticated:
            logger.debug(f"No authenticated user for service {obj.id}")
            return None
        request = ServiceRequest.objects.filter(
            client=user,
            service=obj
        ).order_by('-created_at').first()
        status = request.status if request else None
        logger.debug(f"Service {obj.id} for user {user.id}: request_status={status}, request_id={request.id if request else None}")
        return status
       
class MessageSerializer(serializers.ModelSerializer):
    sender_fullname = serializers.CharField(source='sender.fullname', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'thread', 'sender', 'sender_fullname', 'content', 'timestamp']
        read_only_fields = ['sender', 'timestamp']

class ChatThreadSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = ChatThread
        fields = ['id', 'service_request', 'created_at', 'messages']
        read_only_fields = ['created_at']

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'request', 'amount', 'status', 'timestamp']
        read_only_fields = ['timestamp']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value



class MarketplaceOrderSerializer(serializers.ModelSerializer):
    client = UserSerializer(read_only=True)
    lawyer = UserSerializer(read_only=True)
    service = ServiceSerializer(read_only=True)
    documents = DocumentSerializer(many=True, read_only=True)
    review = ReviewSerializer(read_only=True)

    class Meta:
        model = ServiceRequest
        fields = [
            'id', 'client', 'lawyer', 'service',
            'status', 'created_at', 'updated_at',
            'documents', 'review'
        ]
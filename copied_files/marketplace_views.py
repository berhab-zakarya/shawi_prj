from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from django.core.exceptions import ObjectDoesNotExist
from .models import Service, ServiceRequest, ChatThread, Message, Payment, Document, Review
from .serializers import MarketplaceOrderSerializer, ServiceRequestStatusSerializer, ServiceSerializer, ServiceRequestSerializer, DocumentSerializer, PaymentSerializer, ReviewSerializer, SimpleServiceSerializer
# from invoices.tasks import generate_and_send_invoice
import logging

# Set up logging
logger = logging.getLogger(__name__)

# Placeholder for Stripe payment processing
def process_stripe_payment(amount, payment_data):
    try:
        # Simulate successful payment
        return {"status": "success", "transaction_id": f"TXN-{amount}"}
    except Exception as e:
        return {"status": "failed", "error": str(e)}


class IsLawyerPermission(IsAuthenticated):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return request.user.role.name == 'Lawyer'
    
class AllServiceRequestsView(generics.ListAPIView):
    serializer_class = MarketplaceOrderSerializer
    permission_classes = [IsLawyerPermission]

    def get_queryset(self):
        try:
            return ServiceRequest.objects.all().select_related(
                'client', 'client__profile', 'lawyer', 'lawyer__profile', 'service'
            ).prefetch_related('documents', 'review')
        except Exception as e:
            raise ValidationError(f"Failed to retrieve service requests: {str(e)}")

    def get(self, request, *args, **kwargs):
        try:
            logger.info(f"AllServiceRequestsView: User {request.user.fullname if request.user.is_authenticated else 'anonymous'} accessed all service requests")
            return super().get(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"AllServiceRequestsView error: {str(e)}")
            return Response({"error": f"Failed to list service requests: {str(e)}"}, status=500)
        
class ServiceListView(generics.ListAPIView):
    queryset = Service.objects.all().select_related('lawyer', 'lawyer__profile')
    serializer_class = SimpleServiceSerializer  # Use SimpleServiceSerializer

    def get(self, request, *args, **kwargs):
        try:
            logger.info(f"ServiceListView: User {request.user.fullname if request.user.is_authenticated else 'anonymous'} accessed services")
            return super().get(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"ServiceListView error: {str(e)}")
            return Response({"error": f"Failed to list services: {str(e)}"}, status=500)
        
class ServiceCreateView(generics.CreateAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        try:
            serializer.save(lawyer=self.request.user)
        except Exception as e:
            raise ValidationError(f"Failed to create service: {str(e)}")



class LawyerServicesView(generics.ListAPIView):
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            return Service.objects.filter(lawyer=self.request.user).select_related('lawyer', 'lawyer__profile').prefetch_related('requests__documents', 'requests__review', 'requests__client', 'requests__client__profile', 'requests__lawyer', 'requests__lawyer__profile')
        except Exception as e:
            raise ValidationError(f"Failed to retrieve lawyer services: {str(e)}")

    def get(self, request, *args, **kwargs):
        try:
            logger.info(f"LawyerServicesView: User {request.user.fullname} accessing their services")
            return super().get(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"LawyerServicesView error: {str(e)}")
            return Response({"error": f"Failed to list lawyer services: {str(e)}"}, status=500)
        
class ServiceRequestCreateView(generics.CreateAPIView):
    queryset = ServiceRequest.objects.all()
    serializer_class = ServiceRequestSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        try:
            
            serializer.save(client=self.request.user)
        except Exception as e:
            raise ValidationError(f"Failed to create service request: {str(e)}")


class ClientServiceRequestsView(generics.ListAPIView):
    serializer_class = MarketplaceOrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            ServiceRequest.objects
            .filter(client=self.request.user)
            .select_related('client__profile', 'lawyer__profile', 'service')
            .prefetch_related('documents', 'review')
        ) 

class ServiceRequestUpdateView(generics.UpdateAPIView):
    queryset = ServiceRequest.objects.all()
    serializer_class = ServiceRequestSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['patch']

    def perform_update(self, serializer):
        try:
            service_request = self.get_object()
            if service_request.lawyer != self.request.user:
                raise PermissionDenied("Only the assigned lawyer can update this request's status.")
            serializer.save()
        except ObjectDoesNotExist:
            raise ValidationError("Service request not found")
        except Exception as e:
            raise ValidationError(f"Failed to update service request: {str(e)}")

class ServiceRequestManageView(generics.UpdateAPIView):
    queryset = ServiceRequest.objects.all()
    serializer_class = ServiceRequestStatusSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['patch']

    def perform_update(self, serializer):
        try:
            service_request = self.get_object()
            if service_request.lawyer != self.request.user:
                logger.error(f"ServiceRequestManageView: User {self.request.user.fullname} not authorized")
                raise PermissionDenied("Only the assigned lawyer can manage this request.")
            new_status = self.request.data.get('status')
            if new_status not in ['Accepted', 'Rejected', 'Completed']:
                logger.error(f"ServiceRequestManageView: Invalid status {new_status}")
                raise PermissionDenied("Can only set status to Accepted, Rejected, or Completed.")
            serializer.save(status=new_status)
        except ObjectDoesNotExist:
            logger.error("ServiceRequestManageView: Service request not found")
            raise ValidationError("Service request not found")
        except Exception as e:
            logger.error(f"ServiceRequestManageView error: {str(e)}")
            raise ValidationError(f"Failed to manage service request: {str(e)}")

class PaymentProcessView(generics.CreateAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            service_request = ServiceRequest.objects.get(id=self.kwargs['request_id'])
            if service_request.client != self.request.user:
                raise PermissionDenied("Only the client can initiate a payment.")
            if service_request.status != 'Accepted':
                raise PermissionDenied("Service request must be accepted before payment.")

            # Create payment record
            payment = Payment.objects.create(
                request=service_request,
                amount=service_request.service.price,
                status='Pending'
            )

            # Process payment via Stripe (placeholder)
            payment_result = process_stripe_payment(payment.amount, request.data.get('payment_data', {}))

            if payment_result['status'] == 'success':
                payment.status = 'Completed'
                payment.save()
                service_request.status = 'Paid'
                service_request.save()
                
                # Trigger invoice generation
                # result = generate_and_send_invoice.delay(payment.id)
                
                return Response({
                    'payment': PaymentSerializer(payment).data,
                    'invoice_task': 1
                }, status=201)
            else:
                payment.status = 'Failed'
                payment.save()
                return Response({
                    'error': payment_result.get('error', 'Payment processing failed')
                }, status=400)
        except ObjectDoesNotExist:
            return Response({"error": "Service request not found"}, status=404)
        except Exception as e:
            return Response({"error": f"Payment processing failed: {str(e)}"}, status=500)

class DocumentUploadView(generics.CreateAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        try:
            service_request = ServiceRequest.objects.get(id=self.kwargs['request_id'])
            if self.request.user not in [service_request.client, service_request.lawyer]:
                raise PermissionDenied("Only the client or lawyer can upload documents for this request.")
            serializer.save(request=service_request, uploaded_by=self.request.user)
        except ObjectDoesNotExist:
            raise ValidationError("Service request not found")
        except Exception as e:
            raise ValidationError(f"Failed to upload document: {str(e)}")

class ReviewCreateView(generics.CreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        try:
            service_request = ServiceRequest.objects.get(id=self.kwargs['request_id'])
            if service_request.client != self.request.user:
                raise PermissionDenied("Only the client can submit a review.")
            if service_request.status != 'Completed':
                raise PermissionDenied("Reviews can only be submitted for completed requests.")
            serializer.save(request=service_request)
        except ObjectDoesNotExist:
            raise ValidationError("Service request not found")
        except Exception as e:
            raise ValidationError(f"Failed to create review: {str(e)}")
        



class ServiceUpdateView(generics.UpdateAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['put']

    def perform_update(self, serializer):
        try:
            service = self.get_object()
            if service.lawyer != self.request.user:
                logger.error(f"ServiceUpdateView: User {self.request.user.first_name} not authorized to update service {service.id}")
                raise PermissionDenied("Only the lawyer who created this service can update it.")
            serializer.save()
            logger.info(f"ServiceUpdateView: User {self.request.user.first_name} updated service {service.id}")
        except ObjectDoesNotExist:
            logger.error("ServiceUpdateView: Service not found")
            raise ValidationError("Service not found")
        except Exception as e:
            logger.error(f"ServiceUpdateView error: {str(e)}")
            raise ValidationError(f"Failed to update service: {str(e)}")
class ServiceDetailView(generics.RetrieveAPIView):
    queryset = Service.objects.all().select_related('lawyer', 'lawyer__profile')
    serializer_class = SimpleServiceSerializer  # Use SimpleServiceSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            logger.info(f"ServiceDetailView: User {request.user.fullname if request.user.is_authenticated else 'anonymous'} accessed service {self.kwargs['pk']}")
            return super().get(request, *args, **kwargs)
        except ObjectDoesNotExist:
            logger.error("ServiceDetailView: Service not found")
            return Response({"error": "Service not found"}, status=404)
        except Exception as e:
            logger.error(f"ServiceDetailView error: {str(e)}")
            return Response({"error": f"Failed to retrieve service: {str(e)}"}, status=500)
        

class ServiceDeleteView(generics.DestroyAPIView):
    queryset = Service.objects.all()
    permission_classes = [IsAuthenticated]

    def perform_destroy(self, instance):
        try:
            if instance.lawyer != self.request.user:
                logger.error(f"ServiceDeleteView: User {self.request.user.first_name} not authorized to delete service {instance.id}")
                raise PermissionDenied("Only the lawyer who created this service can delete it.")
            logger.info(f"ServiceDeleteView: User {self.request.user.first_name} deleted service {instance.id}")
            instance.delete()
        except ObjectDoesNotExist:
            logger.error("ServiceDeleteView: Service not found")
            raise ValidationError("Service not found")
        except Exception as e:
            logger.error(f"ServiceDeleteView error: {str(e)}")
            raise ValidationError(f"Failed to delete service: {str(e)}")
        

class IsAdminPermission(IsAuthenticated):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return request.user.role.name == 'Admin'


class AdminServicesView(generics.ListAPIView):
    serializer_class = ServiceSerializer
    permission_classes = [IsAdminPermission]

    def get_queryset(self):
        try:
            return Service.objects.all().select_related('lawyer', 'lawyer__profile').prefetch_related('requests__documents', 'requests__review', 'requests__client', 'requests__client__profile', 'requests__lawyer', 'requests__lawyer__profile')
        except Exception as e:
            raise ValidationError(f"Failed to retrieve services: {str(e)}")

    def get(self, request, *args, **kwargs):
        try:
            logger.info(f"AdminServicesView: Admin {request.user.fullname} accessed all services")
            return super().get(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"AdminServicesView error: {str(e)}")
            return Response({"error": f"Failed to list services: {str(e)}"}, status=500)

class AdminServiceCreateView(generics.CreateAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsAdminPermission]

    def perform_create(self, serializer):
        try:
            lawyer_id = self.request.data.get('lawyer')
            if not lawyer_id:
                raise ValidationError("Lawyer ID is required")
            serializer.save(lawyer_id=lawyer_id)
            logger.info(f"AdminServiceCreateView: Admin {self.request.user.fullname} created service")
        except Exception as e:
            logger.error(f"AdminServiceCreateView error: {str(e)}")
            raise ValidationError(f"Failed to create service: {str(e)}")

class AdminServiceUpdateView(generics.UpdateAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsAdminPermission]
    http_method_names = ['put']

    def perform_update(self, serializer):
        try:
            service = self.get_object()
            serializer.save()
            logger.info(f"AdminServiceUpdateView: Admin {self.request.user.fullname} updated service {service.id}")
        except ObjectDoesNotExist:
            logger.error("AdminServiceUpdateView: Service not found")
            raise ValidationError("Service not found")
        except Exception as e:
            logger.error(f"AdminServiceUpdateView error: {str(e)}")
            raise ValidationError(f"Failed to update service: {str(e)}")

class AdminServiceDeleteView(generics.DestroyAPIView):
    queryset = Service.objects.all()
    permission_classes = [IsAdminPermission]

    def perform_destroy(self, instance):
        try:
            logger.info(f"AdminServiceDeleteView: Admin {self.request.user.fullname} deleted service {instance.id}")
            instance.delete()
        except ObjectDoesNotExist:
            logger.error("AdminServiceDeleteView: Service not found")
            raise ValidationError("Service not found")
        except Exception as e:
            logger.error(f"AdminServiceDeleteView error: {str(e)}")
            raise ValidationError(f"Failed to delete service: {str(e)}")

class AdminPaymentsView(generics.ListAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [IsAdminPermission]

    def get_queryset(self):
        try:
            return Payment.objects.all().select_related('request', 'request__client', 'request__lawyer', 'request__service')
        except Exception as e:
            raise ValidationError(f"Failed to retrieve payments: {str(e)}")

    def get(self, request, *args, **kwargs):
        try:
            logger.info(f"AdminPaymentsView: Admin {self.request.user.fullname} accessed all payments")
            return super().get(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"AdminPaymentsView error: {str(e)}")
            return Response({"error": f"Failed to list payments: {str(e)}"}, status=500)

class AdminPaymentUpdateView(generics.UpdateAPIView):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAdminPermission]
    http_method_names = ['patch']

    def perform_update(self, serializer):
        try:
            payment = self.get_object()
            new_status = self.request.data.get('status')
            if new_status not in ['Pending', 'Completed', 'Failed']:
                raise ValidationError("Invalid status. Must be Pending, Completed, or Failed.")
            serializer.save()
            logger.info(f"AdminPaymentUpdateView: Admin {self.request.user.fullname} updated payment {payment.id}")
        except ObjectDoesNotExist:
            logger.error("AdminPaymentUpdateView: Payment not found")
            raise ValidationError("Payment not found")
        except Exception as e:
            logger.error(f"AdminPaymentUpdateView error: {str(e)}")
            raise ValidationError(f"Failed to update payment: {str(e)}")

class AdminPaymentDeleteView(generics.DestroyAPIView):
    queryset = Payment.objects.all()
    permission_classes = [IsAdminPermission]

    def perform_destroy(self, instance):
        try:
            logger.info(f"AdminPaymentDeleteView: Admin {self.request.user.fullname} deleted payment {instance.id}")
            instance.delete()
        except ObjectDoesNotExist:
            logger.error("AdminPaymentDeleteView: Payment not found")
            raise ValidationError("Payment not found")
        except Exception as e:
            logger.error(f"AdminPaymentDeleteView error: {str(e)}")
            raise ValidationError(f"Failed to delete payment: {str(e)}")

class AdminDocumentsView(generics.ListAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [IsAdminPermission]

    def get_queryset(self):
        try:
            return Document.objects.all().select_related('request', 'uploaded_by', 'request__client', 'request__lawyer', 'request__service')
        except Exception as e:
            raise ValidationError(f"Failed to retrieve documents: {str(e)}")

    def get(self, request, *args, **kwargs):
        try:
            logger.info(f"AdminDocumentsView: Admin {self.request.user.fullname} accessed all documents")
            return super().get(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"AdminDocumentsView error: {str(e)}")
            return Response({"error": f"Failed to list documents: {str(e)}"}, status=500)

class AdminDocumentUpdateView(generics.UpdateAPIView):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [IsAdminPermission]
    http_method_names = ['put']

    def perform_update(self, serializer):
        try:
            document = self.get_object()
            serializer.save()
            logger.info(f"AdminDocumentUpdateView: Admin {self.request.user.fullname} updated document {document.id}")
        except ObjectDoesNotExist:
            logger.error("AdminDocumentUpdateView: Document not found")
            raise ValidationError("Document not found")
        except Exception as e:
            logger.error(f"AdminDocumentUpdateView error: {str(e)}")
            raise ValidationError(f"Failed to update document: {str(e)}")

class AdminDocumentDeleteView(generics.DestroyAPIView):
    queryset = Document.objects.all()
    permission_classes = [IsAdminPermission]

    def perform_destroy(self, instance):
        try:
            logger.info(f"AdminDocumentDeleteView: Admin {self.request.user.fullname} deleted document {instance.id}")
            instance.delete()
        except ObjectDoesNotExist:
            logger.error("AdminDocumentDeleteView: Document not found")
            raise ValidationError("Document not found")
        except Exception as e:
            logger.error(f"AdminDocumentDeleteView error: {str(e)}")
            raise ValidationError(f"Failed to delete document: {str(e)}")

class AdminReviewsView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAdminPermission]

    def get_queryset(self):
        try:
            return Review.objects.all().select_related('request', 'request__client', 'request__lawyer', 'request__service')
        except Exception as e:
            raise ValidationError(f"Failed to retrieve reviews: {str(e)}")

    def get(self, request, *args, **kwargs):
        try:
            logger.info(f"AdminReviewsView: Admin {self.request.user.fullname} accessed all reviews")
            return super().get(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"AdminReviewsView error: {str(e)}")
            return Response({"error": f"Failed to list reviews: {str(e)}"}, status=500)

class AdminReviewUpdateView(generics.UpdateAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAdminPermission]
    http_method_names = ['patch']

    def perform_update(self, serializer):
        try:
            review = self.get_object()
            serializer.save()
            logger.info(f"AdminReviewUpdateView: Admin {self.request.user.fullname} updated review {review.id}")
        except ObjectDoesNotExist:
            logger.error("AdminReviewUpdateView: Review not found")
            raise ValidationError("Review not found")
        except Exception as e:
            logger.error(f"AdminReviewUpdateView error: {str(e)}")
            raise ValidationError(f"Failed to update review: {str(e)}")

class AdminReviewDeleteView(generics.DestroyAPIView):
    queryset = Review.objects.all()
    permission_classes = [IsAdminPermission]

    def perform_destroy(self, instance):
        try:
            logger.info(f"AdminReviewDeleteView: Admin {self.request.user.fullname} deleted review {instance.id}")
            instance.delete()
        except ObjectDoesNotExist:
            logger.error("AdminReviewDeleteView: Review not found")
            raise ValidationError("Review not found")
        except Exception as e:
            logger.error(f"AdminReviewDeleteView error: {str(e)}")
            raise ValidationError(f"Failed to delete review: {str(e)}")
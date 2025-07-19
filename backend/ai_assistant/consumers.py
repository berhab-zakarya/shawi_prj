import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from .models import AIResponse
from .serializers import AIResponseSerializer, AIQuestionSerializer
from .utils import get_similar_documents, generate_qna_answer, analyze_document
from documents.models import Document
from documents.views import DocumentAnalyzeView
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

class AIAssistantConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """Handle WebSocket connection."""
        self.user = self.scope["user"]
        
        # Check if user is authenticated
        if self.user.is_anonymous:
            await self.close(code=4001)
            return
            
        # Join user-specific group
        self.group_name = f"ai_assistant_{self.user.id}"
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send welcome message
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'مرحباً بك في المساعد القانوني الذكي',
            'user': self.user.fullname if hasattr(self.user, 'fullname') else self.user.username
        }))

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection."""
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        """Handle incoming WebSocket messages."""
        try:
            data = json.loads(text_data)
            message_type = data.get('type', 'unknown')
            
            if message_type == 'ask_question':
                await self.handle_question(data)
            elif message_type == 'analyze_document':
                await self.handle_document_analysis(data)
            elif message_type == 'rate_response':
                await self.handle_rating(data)
            elif message_type == 'get_history':
                await self.handle_history_request(data)
            elif message_type == 'typing':
                await self.handle_typing_indicator(data)
            else:
                await self.send_error(f"نوع رسالة غير مدعوم: {message_type}")
                
        except json.JSONDecodeError:
            await self.send_error("خطأ في تحليل البيانات المرسلة")
        except Exception as e:
            logger.error(f"Error in receive: {str(e)}")
            await self.send_error(f"خطأ غير متوقع: {str(e)}")

    async def handle_question(self, data):
        """Handle AI question processing."""
        try:
            question = data.get('question', '').strip()
            use_context = data.get('use_context', False)
            
            if not question:
                await self.send_error("يجب إدخال سؤال")
                return
            
            # Validate question length
            if len(question) > 1000:
                await self.send_error("السؤال طويل جداً (الحد الأقصى 1000 حرف)")
                return
            
            # Send processing status
            await self.send(text_data=json.dumps({
                'type': 'processing_started',
                'message': 'جاري معالجة السؤال...'
            }))
            
            context = ""
            context_documents = []
            
            # Get context documents if requested
            if use_context:
                try:
                    await self.send(text_data=json.dumps({
                        'type': 'processing_status',
                        'message': 'جاري البحث في الوثائق ذات الصلة...'
                    }))
                    
                    similar_docs = await get_similar_documents(question, self.user)
                    context_documents = similar_docs
                    
                    if similar_docs:
                        context_parts = []
                        analyzer = DocumentAnalyzeView()
                        
                        for doc in similar_docs:
                            try:
                                doc_content = await database_sync_to_async(analyzer.get_file_content)(doc)
                                context_parts.append(f"**من الوثيقة: {doc.title}**\n{doc_content[:1000]}...")
                            except Exception as e:
                                logger.warning(f"Error getting document content: {str(e)}")
                                continue
                        
                        context = "\n\n".join(context_parts)
                        
                        await self.send(text_data=json.dumps({
                            'type': 'context_found',
                            'message': f'تم العثور على {len(similar_docs)} وثيقة ذات صلة',
                            'documents': [{'id': doc.id, 'title': doc.title} for doc in similar_docs]
                        }))
                    else:
                        await self.send(text_data=json.dumps({
                            'type': 'no_context',
                            'message': 'لم يتم العثور على وثائق ذات صلة'
                        }))
                except Exception as e:
                    logger.error(f"Error getting context: {str(e)}")
                    await self.send(text_data=json.dumps({
                        'type': 'context_error',
                        'message': 'خطأ في البحث عن الوثائق ذات الصلة'
                    }))
            
            # Generate AI answer
            await self.send(text_data=json.dumps({
                'type': 'processing_status',
                'message': 'جاري توليد الإجابة...'
            }))
            
            answer = await generate_qna_answer(question, context)
            
            # Save response to database
            ai_response = await database_sync_to_async(AIResponse.objects.create)(
                user=self.user,
                question=question,
                answer=answer
            )
            
            # Add context documents if any
            if context_documents:
                await database_sync_to_async(ai_response.context_documents.set)(context_documents)
            
            # Serialize response
            serializer = AIResponseSerializer(ai_response)
            response_data = await database_sync_to_async(lambda: serializer.data)()
            
            # Send final response
            await self.send(text_data=json.dumps({
                'type': 'question_answered',
                'response': response_data,
                'message': 'تم الحصول على الإجابة بنجاح'
            }))
            
        except Exception as e:
            logger.error(f"Error handling question: {str(e)}")
            await self.send_error(f"خطأ في معالجة السؤال: {str(e)}")

    async def handle_document_analysis(self, data):
        """Handle document analysis requests."""
        try:
            document_id = data.get('document_id')
            
            if not document_id:
                await self.send_error("معرف الوثيقة مطلوب")
                return
            
            # Get document
            try:
                document = await database_sync_to_async(
                    Document.objects.get
                )(id=document_id, uploaded_by=self.user)
            except Document.DoesNotExist:
                await self.send_error("الوثيقة غير موجودة أو ليس لديك صلاحية للوصول إليها")
                return
            
            # Send processing status
            await self.send(text_data=json.dumps({
                'type': 'document_analysis_started',
                'message': f'جاري تحليل الوثيقة: {document.title}...'
            }))
            
            # Get document content
            analyzer = DocumentAnalyzeView()
            document_content = await database_sync_to_async(analyzer.get_file_content)(document)
            
            # Analyze document
            analysis = await analyze_document(document_content)
            
            # Create AI response for the analysis
            question = f"تحليل الوثيقة: {document.title}"
            ai_response = await database_sync_to_async(AIResponse.objects.create)(
                user=self.user,
                question=question,
                answer=analysis
            )
            
            # Add the analyzed document to context
            await database_sync_to_async(ai_response.context_documents.add)(document)
            
            # Serialize response
            serializer = AIResponseSerializer(ai_response)
            response_data = await database_sync_to_async(lambda: serializer.data)()
            
            # Send analysis result
            await self.send(text_data=json.dumps({
                'type': 'document_analyzed',
                'response': response_data,
                'document': {
                    'id': document.id,
                    'title': document.title
                },
                'message': 'تم تحليل الوثيقة بنجاح'
            }))
            
        except Exception as e:
            logger.error(f"Error analyzing document: {str(e)}")
            await self.send_error(f"خطأ في تحليل الوثيقة: {str(e)}")

    async def handle_rating(self, data):
        """Handle response rating."""
        try:
            response_id = data.get('response_id')
            rating = data.get('rating')
            
            if not response_id or not rating:
                await self.send_error("معرف الإجابة والتقييم مطلوبان")
                return
            
            if not isinstance(rating, int) or rating < 1 or rating > 5:
                await self.send_error("التقييم يجب أن يكون رقماً بين 1 و 5")
                return
            
            # Get AI response
            try:
                ai_response = await database_sync_to_async(
                    AIResponse.objects.get
                )(id=response_id, user=self.user)
            except AIResponse.DoesNotExist:
                await self.send_error("الإجابة غير موجودة أو ليس لديك صلاحية للوصول إليها")
                return
            
            # Update rating
            ai_response.rating = rating
            await database_sync_to_async(ai_response.save)()
            
            await self.send(text_data=json.dumps({
                'type': 'rating_saved',
                'response_id': response_id,
                'rating': rating,
                'message': 'تم حفظ التقييم بنجاح'
            }))
            
        except Exception as e:
            logger.error(f"Error handling rating: {str(e)}")
            await self.send_error(f"خطأ في حفظ التقييم: {str(e)}")

    async def handle_history_request(self, data):
        """Handle request for user's AI response history."""
        try:
            limit = data.get('limit', 10)
            offset = data.get('offset', 0)
            
            # Get user's responses
            responses = await database_sync_to_async(
                lambda: list(AIResponse.objects.filter(user=self.user).order_by('-created_at')[offset:offset+limit])
            )()
            
            # Serialize responses
            serializer = AIResponseSerializer(responses, many=True)
            responses_data = await database_sync_to_async(lambda: serializer.data)()
            
            await self.send(text_data=json.dumps({
                'type': 'history_retrieved',
                'responses': responses_data,
                'count': len(responses),
                'offset': offset,
                'message': 'تم استرجاع السجل بنجاح'
            }))
            
        except Exception as e:
            logger.error(f"Error retrieving history: {str(e)}")
            await self.send_error(f"خطأ في استرجاع السجل: {str(e)}")

    async def handle_typing_indicator(self, data):
        """Handle typing indicator from client."""
        is_typing = data.get('is_typing', False)
        
        # Broadcast typing status to user's group (if needed for multi-device support)
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'typing_status',
                'is_typing': is_typing,
                'user_id': self.user.id
            }
        )

    async def typing_status(self, event):
        """Handle typing status broadcast."""
        await self.send(text_data=json.dumps({
            'type': 'typing_status',
            'is_typing': event['is_typing'],
            'user_id': event['user_id']
        }))

    async def send_error(self, message):
        """Send error message to client."""
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': message
        }))

    async def send_status(self, message):
        """Send status message to client."""
        await self.send(text_data=json.dumps({
            'type': 'status',
            'message': message
        }))
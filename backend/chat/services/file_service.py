import os
from django.core.files.storage import default_storage
from notifications.utils import send_user_notification
# from settings import ALLOWED_FILE_TYPES, MAX_FILE_SIZE
from ..exceptions import FileUploadException

ALLOWED_FILE_TYPES = ['pdf', 'jpg', 'jpeg', 'png', 'docx']
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

class FileService:
    @staticmethod
    def validate_file(file):
        if not file:
            raise FileUploadException(detail="No file provided")
        
        ext = os.path.splitext(file.name)[1].lower().lstrip('.')
        if ext not in ALLOWED_FILE_TYPES:
            raise FileUploadException(detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_FILE_TYPES)}")
        
        if file.size > MAX_FILE_SIZE:
            raise FileUploadException(detail="File size exceeds 10MB limit")
        
        return True

    @staticmethod
    def save_file(file, user, room):
        try:
            file_path = default_storage.save(f"chat_files/{file.name}", file)
            file_url = default_storage.url(file_path)
            # Send notification to room participants
            for participant in room.participants.exclude(id=user.id):
                send_user_notification(
                    user=participant,
                    title=f"New File in {room.name}",
                    message=f"{user.username} uploaded a file: {file.name}",
                    notification_type='document_uploaded',
                    content_object=room,
                    priority='medium',
                    action_url=file_url,
                    action_text="View File"
                )
            return file_url
        except Exception as e:
            raise FileUploadException(detail=f"Failed to save file: {str(e)}")
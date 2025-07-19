from rest_framework.exceptions import APIException

class ChatRoomException(APIException):
    status_code = 400
    default_detail = 'Chat room error occurred'
    default_code = 'chat_room_error'

class FileUploadException(APIException):
    status_code = 400
    default_detail = 'File upload error occurred'
    default_code = 'file_upload_error'

class WebSocketException(Exception):
    pass

class NotificationException(APIException):
    status_code = 400
    default_detail = 'Notification error occurred'
    default_code = 'notification_error'
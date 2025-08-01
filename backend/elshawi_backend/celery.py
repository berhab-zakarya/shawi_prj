import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'elshawi_backend.settings')

app = Celery('elshawi_backend')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
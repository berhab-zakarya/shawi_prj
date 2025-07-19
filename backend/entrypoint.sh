#!/bin/bash
set -e

echo "🔧 Starting Elshawi Backend Services (Dev Mode)..."

# Create logs directory
mkdir -p logs

# Optional: Start Celery Worker (background)
echo "🚀 Starting Celery Worker..."
celery -A elshawi_backend worker --loglevel=info -P gevent &

# Optional: Start Celery Beat (background)
echo "🚀 Starting Celery Beat..."
celery -A elshawi_backend beat --loglevel=info &

# ⚠️ مهم: لا تحجب الإخراج stdout/stderr كي يعمل autoreload
echo "🚀 Starting Django Dev Server with autoreload..."
exec python manage.py runserver 0.0.0.0:8000

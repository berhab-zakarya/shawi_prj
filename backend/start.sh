#!/bin/bash
set -e

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting Gunicorn..."
exec gunicorn elshawi_backend.wsgi:application --bind 0.0.0.0:8000 --workers 3
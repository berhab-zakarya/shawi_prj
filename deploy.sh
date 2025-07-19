#!/bin/bash

# 🚀 Production Deployment Script for Hostinger VPS
# Usage: ./deploy.sh

set -e

echo "🚀 Starting deployment to production..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons."
   exit 1
fi

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env.prod exists
if [[ ! -f .env.prod ]]; then
    print_error ".env.prod file not found. Please create it from the template."
    exit 1
fi

print_status "Pulling latest changes from Git..."
git pull origin main

print_status "Creating necessary directories..."
mkdir -p logs media static ssl

print_status "Setting proper permissions..."
sudo chown -R $USER:$USER logs media static
chmod 755 logs media static

print_status "Building and starting services..."
docker-compose -f docker-compose.prod.yml down --remove-orphans
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

print_status "Waiting for services to be ready..."
sleep 30

print_status "Running database migrations..."
docker-compose -f docker-compose.prod.yml exec -T backend python manage.py migrate

print_status "Collecting static files..."
docker-compose -f docker-compose.prod.yml exec -T backend python manage.py collectstatic --noinput

print_status "Creating superuser (if needed)..."
docker-compose -f docker-compose.prod.yml exec -T backend python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superuser created')
else:
    print('Superuser already exists')
"

print_status "Checking service status..."
docker-compose -f docker-compose.prod.yml ps

print_status "Deployment completed! 🎉"
print_warning "Don't forget to:"
print_warning "1. Update your domain DNS to point to this server"
print_warning "2. Set up SSL certificates (Let's Encrypt recommended)"
print_warning "3. Change default admin password"
print_warning "4. Configure firewall rules"

echo ""
echo -e "${GREEN}Your application should be available at:${NC}"
echo -e "${GREEN}- Frontend: http://eilflawyers.com${NC}"
echo -e "${GREEN}- Admin: http://eilflawyers.com/admin${NC}"
echo -e "${GREEN}- API: http://eilflawyers.com/api${NC}"
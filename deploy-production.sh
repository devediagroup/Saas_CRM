#!/bin/bash

# 🚀 Production Deployment Script for EchoOps CRM
echo "🏗️ بدء النشر الإنتاجي لـ EchoOps CRM..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
print_status "التحقق من متطلبات النظام..."

if ! command -v docker &> /dev/null; then
    print_error "Docker غير مثبت. يرجى تثبيت Docker أولاً."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose غير مثبت. يرجى تثبيت Docker Compose أولاً."
    exit 1
fi

print_success "Docker و Docker Compose مثبتان بنجاح"

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning "ملف .env غير موجود. سيتم نسخه من .env.example"
    cp .env.example .env
    print_warning "يرجى تحديث ملف .env بالقيم الصحيحة للإنتاج"
    read -p "هل تريد المتابعة؟ (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create necessary directories
print_status "إنشاء المجلدات المطلوبة..."
mkdir -p ssl logs uploads

# Generate SSL certificates if they don't exist
if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
    print_status "إنشاء شهادات SSL للتطوير..."
    openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes \
        -subj "/C=SA/ST=Riyadh/L=Riyadh/O=EchoOps/OU=IT/CN=localhost"
    print_success "تم إنشاء شهادات SSL"
fi

# Build and start services
print_status "بناء وتشغيل الخدمات..."

# Stop any running containers
docker-compose down --remove-orphans

# Build images
print_status "بناء Docker images..."
docker-compose build --no-cache

# Start services
print_status "تشغيل الخدمات..."
docker-compose up -d

# Wait for services to be healthy
print_status "انتظار جاهزية الخدمات..."
sleep 30

# Check service health
print_status "فحص حالة الخدمات..."

services=("mysql" "redis" "backend" "frontend")
all_healthy=true

for service in "${services[@]}"; do
    if docker-compose ps $service | grep -q "healthy\|running"; then
        print_success "$service جاهز ويعمل بنجاح"
    else
        print_error "$service غير جاهز أو توجد مشكلة"
        all_healthy=false
    fi
done

if [ "$all_healthy" = true ]; then
    print_success "جميع الخدمات تعمل بنجاح!"
    echo
    echo "🌐 الروابط المتاحة:"
    echo "   - التطبيق الرئيسي: http://localhost:8080"
    echo "   - API Backend: http://localhost:3001"
    echo "   - Frontend Direct: http://localhost:3000"
    echo "   - phpMyAdmin: http://localhost:8082"
    echo "   - Redis Commander: http://localhost:8081"
    echo
    echo "📋 معلومات مفيدة:"
    echo "   - لمراقبة السجلات: docker-compose logs -f"
    echo "   - لإيقاف النظام: docker-compose down"
    echo "   - لإعادة البناء: docker-compose build --no-cache"
    echo
    print_success "النشر مكتمل بنجاح! 🎉"
else
    print_error "بعض الخدمات لا تعمل بشكل صحيح. يرجى فحص السجلات:"
    echo "docker-compose logs"
    exit 1
fi

#!/bin/bash

# 🐳 EchoOps CRM - ملف تشغيل Docker
echo "🚀 بدء تشغيل EchoOps CRM باستخدام Docker..."

# التحقق من وجود Docker
if ! command -v docker &> /dev/null; then
    echo "❌ خطأ: Docker غير مثبت"
    exit 1
fi

# التحقق من وجود Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ خطأ: Docker Compose غير مثبت"
    exit 1
fi

echo "✅ Docker و Docker Compose مثبتان"

# إنشاء مجلدات SSL إذا لم تكن موجودة
mkdir -p ssl
if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
    echo "🔐 إنشاء شهادات SSL مؤقتة..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/key.pem -out ssl/cert.pem \
        -subj "/C=SA/ST=Riyadh/L=Riyadh/O=EchoOps/CN=localhost"
fi

# بناء وتشغيل الخدمات
echo "🏗️  بناء وتشغيل الخدمات..."
docker-compose up --build -d

echo "✅ تم تشغيل جميع الخدمات!"
echo ""
echo "🌐 الروابط:"
echo "  - الواجهة الأمامية: https://localhost"
echo "  - الخادم الخلفي: https://localhost/api"
echo "  - PhpMyAdmin: http://localhost:8080"
echo "  - Redis Commander: http://localhost:8081"
echo ""
echo "🔑 بيانات تسجيل الدخول:"
echo "  - المدير: admin@echops.com / admin123"
echo "  - المستخدم: test@echops.com / test123"
echo ""
echo "📊 حالة الخدمات:"
docker-compose ps

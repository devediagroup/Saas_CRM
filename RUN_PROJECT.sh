#!/bin/bash

# 🎉 EchoOps Real Estate CRM - ملف التشغيل الشامل
# هذا الملف يقوم بتشغيل المشروع بالكامل مع جميع المتطلبات

echo "🚀 بدء تشغيل مشروع EchoOps Real Estate CRM..."

# التحقق من وجود Node.js
if ! command -v node &> /dev/null; then
    echo "❌ خطأ: Node.js غير مثبت"
    echo "يرجى تثبيت Node.js من https://nodejs.org/"
    exit 1
fi

# التحقق من إصدار Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ خطأ: Node.js 18+ مطلوب"
    echo "الإصدار الحالي: $(node -v)"
    echo "يرجى تحديث Node.js إلى الإصدار 18 أو أحدث"
    exit 1
fi

echo "✅ Node.js $(node -v) مثبت"

# التحقق من وجود MySQL
if ! command -v mysql &> /dev/null; then
    echo "❌ خطأ: MySQL غير مثبت"
    echo "يرجى تثبيت MySQL 8.0+"
    exit 1
fi

echo "✅ MySQL مثبت"

# التحقق من وجود Docker (اختياري)
if command -v docker &> /dev/null; then
    echo "✅ Docker مثبت (اختياري)"
    DOCKER_AVAILABLE=true
else
    echo "⚠️  Docker غير مثبت (اختياري)"
    DOCKER_AVAILABLE=false
fi

# إنشاء ملفات البيئة إذا لم تكن موجودة
if [ ! -f "backend/.env" ]; then
    echo "📝 إنشاء ملف .env للخلفية..."
    cat > backend/.env << EOF
# EchoOps CRM Environment Configuration
NODE_ENV=development
PORT=3001

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=echoops_crm

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

# WhatsApp Configuration
WHATSAPP_API_KEY=your_whatsapp_api_key
WHATSAPP_PHONE_NUMBER=your_whatsapp_phone

# AI Configuration
OPENAI_API_KEY=your_openai_api_key

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
EOF
    echo "✅ تم إنشاء ملف .env للخلفية"
    echo "⚠️  يرجى تعديل القيم حسب إعداداتك"
fi

if [ ! -f "frontend/.env" ]; then
    echo "📝 إنشاء ملف .env للواجهة الأمامية..."
    cat > frontend/.env << EOF
# EchoOps CRM Frontend Environment
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=EchoOps CRM
VITE_APP_VERSION=1.0.0
EOF
    echo "✅ تم إنشاء ملف .env للواجهة الأمامية"
fi

# إنشاء قاعدة البيانات
echo "🗄️  إنشاء قاعدة البيانات..."
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS echoops_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || {
    echo "❌ خطأ في إنشاء قاعدة البيانات"
    echo "يرجى التأكد من إعدادات MySQL"
    exit 1
}
echo "✅ تم إنشاء قاعدة البيانات"

# تثبيت التبعيات
echo "📦 تثبيت تبعيات الخلفية..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ خطأ في تثبيت تبعيات الخلفية"
    exit 1
fi
echo "✅ تم تثبيت تبعيات الخلفية"

echo "📦 تثبيت تبعيات الواجهة الأمامية..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ خطأ في تثبيت تبعيات الواجهة الأمامية"
    exit 1
fi
echo "✅ تم تثبيت تبعيات الواجهة الأمامية"

# العودة للمجلد الرئيسي
cd ..

# تشغيل الهجرات
echo "🔄 تشغيل هجرات قاعدة البيانات..."
cd backend
npm run migration:run
if [ $? -ne 0 ]; then
    echo "❌ خطأ في تشغيل الهجرات"
    exit 1
fi
echo "✅ تم تشغيل الهجرات"

# تشغيل البذور
echo "🌱 تشغيل بذور قاعدة البيانات..."
npm run seed:run
if [ $? -ne 0 ]; then
    echo "❌ خطأ في تشغيل البذور"
    exit 1
fi
echo "✅ تم تشغيل البذور"

cd ..

# إنشاء ملفات التشغيل
echo "📝 إنشاء ملفات التشغيل..."

# ملف تشغيل الخلفية
cat > start-backend.sh << 'EOF'
#!/bin/bash
cd backend
echo "🚀 تشغيل الخادم الخلفي..."
npm run start:dev
EOF

# ملف تشغيل الواجهة الأمامية
cat > start-frontend.sh << 'EOF'
#!/bin/bash
cd frontend
echo "🚀 تشغيل الواجهة الأمامية..."
npm run dev
EOF

# ملف تشغيل الاختبارات
cat > run-tests.sh << 'EOF'
#!/bin/bash
echo "🧪 تشغيل جميع الاختبارات..."

echo "📋 اختبارات الوحدة (Backend)..."
cd backend && npm run test

echo "📋 اختبارات التكامل (Backend)..."
npm run test:e2e

echo "📋 اختبارات الأمان (Backend)..."
npm run test:security

echo "📋 اختبارات النهاية إلى النهاية (Frontend)..."
cd ../frontend && npm run test:e2e

echo "✅ تم تشغيل جميع الاختبارات!"
EOF

# ملف تشغيل المشروع بالكامل
cat > start-all.sh << 'EOF'
#!/bin/bash
echo "🚀 تشغيل مشروع EchoOps CRM بالكامل..."

# تشغيل الخلفية في الخلفية
echo "🔧 تشغيل الخادم الخلفي..."
cd backend
npm run start:dev &
BACKEND_PID=$!
cd ..

# انتظار قليل لبدء الخادم
sleep 5

# تشغيل الواجهة الأمامية
echo "🎨 تشغيل الواجهة الأمامية..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "✅ تم تشغيل المشروع بالكامل!"
echo "🌐 الخادم الخلفي: http://localhost:3001"
echo "🎨 الواجهة الأمامية: http://localhost:3000"
echo ""
echo "لإيقاف المشروع، اضغط Ctrl+C"

# انتظار إشارة الإيقاف
trap "echo '🛑 إيقاف المشروع...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT

# انتظار انتهاء العمليات
wait
EOF

# جعل الملفات قابلة للتنفيذ
chmod +x start-backend.sh
chmod +x start-frontend.sh
chmod +x run-tests.sh
chmod +x start-all.sh

echo "✅ تم إنشاء ملفات التشغيل"

# إنشاء ملف معلومات المشروع
cat > PROJECT_INFO.md << 'EOF'
# 🎉 EchoOps Real Estate CRM - معلومات المشروع

## 🚀 كيفية التشغيل

### 1. تشغيل المشروع بالكامل
```bash
./start-all.sh
```

### 2. تشغيل الخلفية فقط
```bash
./start-backend.sh
```

### 3. تشغيل الواجهة الأمامية فقط
```bash
./start-frontend.sh
```

### 4. تشغيل الاختبارات
```bash
./run-tests.sh
```

## 🌐 الروابط

- **الواجهة الأمامية**: http://localhost:3000
- **الخادم الخلفي**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api

## 🔑 بيانات تسجيل الدخول

### المدير
- **البريد الإلكتروني**: admin@echops.com
- **كلمة المرور**: admin123

### المستخدم العادي
- **البريد الإلكتروني**: test@echops.com
- **كلمة المرور**: test123

## 📁 هيكل المشروع

```
crm-strapi/
├── backend/          # الخادم الخلفي (NestJS)
├── frontend/         # الواجهة الأمامية (React)
├── docs/            # التوثيق
├── tests/           # الاختبارات
└── scripts/         # ملفات التشغيل
```

## 🛠️ الأوامر المفيدة

### Backend
```bash
cd backend
npm run start:dev      # تشغيل في وضع التطوير
npm run build          # بناء المشروع
npm run start:prod     # تشغيل في وضع الإنتاج
npm run test           # اختبارات الوحدة
npm run test:e2e       # اختبارات التكامل
npm run migration:run  # تشغيل الهجرات
npm run seed:run       # تشغيل البذور
```

### Frontend
```bash
cd frontend
npm run dev            # تشغيل في وضع التطوير
npm run build          # بناء المشروع
npm run preview        # معاينة الإنتاج
npm run test:e2e       # اختبارات النهاية إلى النهاية
```

## 🔧 استكشاف الأخطاء

### مشاكل قاعدة البيانات
1. تأكد من تشغيل MySQL
2. تحقق من إعدادات الاتصال في `backend/.env`
3. شغل الهجرات: `npm run migration:run`

### مشاكل الخادم
1. تحقق من المنفذ 3001
2. تأكد من تثبيت التبعيات
3. تحقق من ملف `.env`

### مشاكل الواجهة الأمامية
1. تحقق من المنفذ 3000
2. تأكد من تشغيل الخادم الخلفي
3. تحقق من ملف `.env`

## 📞 الدعم

إذا واجهت أي مشاكل، راجع:
- `README.md` - دليل سريع
- `USER_MANUAL.md` - دليل المستخدم
- `DEVELOPER_GUIDE.md` - دليل المطور
- `PROJECT_COMPLETION_REPORT.md` - التقرير النهائي

---

**تم إنشاء هذا الملف تلقائياً بواسطة RUN_PROJECT.sh**
EOF

echo "✅ تم إنشاء ملف معلومات المشروع"

# عرض ملخص المشروع
echo ""
echo "🎉 تم إعداد مشروع EchoOps CRM بنجاح!"
echo ""
echo "📋 الملفات المنشأة:"
echo "  - start-all.sh (تشغيل المشروع بالكامل)"
echo "  - start-backend.sh (تشغيل الخلفية)"
echo "  - start-frontend.sh (تشغيل الواجهة الأمامية)"
echo "  - run-tests.sh (تشغيل الاختبارات)"
echo "  - PROJECT_INFO.md (معلومات المشروع)"
echo ""
echo "🚀 لتشغيل المشروع:"
echo "  ./start-all.sh"
echo ""
echo "📚 للمزيد من المعلومات:"
echo "  cat PROJECT_INFO.md"
echo ""
echo "🔑 بيانات تسجيل الدخول:"
echo "  المدير: admin@echops.com / admin123"
echo "  المستخدم: test@echops.com / test123"
echo ""
echo "✅ المشروع جاهز للاستخدام!"

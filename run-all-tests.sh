#!/bin/bash

# 🧪 EchoOps CRM - تشغيل جميع الاختبارات
echo "🧪 بدء تشغيل جميع اختبارات EchoOps CRM..."

# التحقق من وجود Node.js
if ! command -v node &> /dev/null; then
    echo "❌ خطأ: Node.js غير مثبت"
    exit 1
fi

echo "✅ Node.js $(node -v) مثبت"

# تشغيل اختبارات الوحدة (Backend)
echo ""
echo "📋 اختبارات الوحدة (Backend)..."
cd backend
npm run test
if [ $? -ne 0 ]; then
    echo "❌ فشلت اختبارات الوحدة"
    exit 1
fi
echo "✅ تم تشغيل اختبارات الوحدة بنجاح"

# تشغيل اختبارات التكامل (Backend)
echo ""
echo "📋 اختبارات التكامل (Backend)..."
npm run test:e2e
if [ $? -ne 0 ]; then
    echo "❌ فشلت اختبارات التكامل"
    exit 1
fi
echo "✅ تم تشغيل اختبارات التكامل بنجاح"

# تشغيل اختبارات الأمان (Backend)
echo ""
echo "📋 اختبارات الأمان (Backend)..."
npm run test:security
if [ $? -ne 0 ]; then
    echo "❌ فشلت اختبارات الأمان"
    exit 1
fi
echo "✅ تم تشغيل اختبارات الأمان بنجاح"

cd ..

# تشغيل اختبارات النهاية إلى النهاية (Frontend)
echo ""
echo "📋 اختبارات النهاية إلى النهاية (Frontend)..."
cd frontend
npm run test:e2e
if [ $? -ne 0 ]; then
    echo "❌ فشلت اختبارات النهاية إلى النهاية"
    exit 1
fi
echo "✅ تم تشغيل اختبارات النهاية إلى النهاية بنجاح"

cd ..

echo ""
echo "🎉 تم تشغيل جميع الاختبارات بنجاح!"
echo ""
echo "📊 ملخص النتائج:"
echo "  ✅ اختبارات الوحدة (Backend)"
echo "  ✅ اختبارات التكامل (Backend)"
echo "  ✅ اختبارات الأمان (Backend)"
echo "  ✅ اختبارات النهاية إلى النهاية (Frontend)"
echo ""
echo "🚀 النظام جاهز للإنتاج!"

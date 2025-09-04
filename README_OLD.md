# 🏗️ **EchoOps Real Estate CRM**

> نظام إدارة علاقات العملاء المتكامل لشركات العقارات

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/your-org/echoops-crm)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com/your-org/echoops-crm)
[![License](https://img.shields.io/badge/license-MIT-green)](https://github.com/your-org/echoops-crm)
[![Progress](https://img.shields.io/badge/progress-100%25-success)](https://github.com/your-org/echoops-crm)

## 🎯 **نظرة عامة**

**EchoOps Real Estate CRM** هو نظام إدارة علاقات العملاء متخصص في مجال العقارات، مصمم لمساعدة الشركات العقارية على إدارة عملائها المحتملين، صفقاتها، مشاريعها، ووحداتها العقارية بكفاءة وأمان عاليين.

### ✨ **الميزات الرئيسية**

- 🏢 **إدارة شاملة للعقارات**: مشاريع، وحدات، مطورين
- 👥 **نظام صلاحيات متقدم**: 5 مستويات من الأدوار مع تحكم دقيق
- 🔒 **أمان عالي**: Row-Level Security (RLS) لحماية البيانات
- 📊 **تقارير وتحليلات متقدمة**: لوحات معلومات تفاعلية
- 🌐 **واجهة عربية**: تصميم متجاوب ومحلي بالكامل
- 📱 **تجربة مستخدم ممتازة**: واجهة حديثة وسهلة الاستخدام

---

## 🚀 **بدء الاستخدام السريع**

### **المتطلبات الأساسية**
- Node.js 18.x أو أحدث
- MySQL 8.x أو أحدث
- npm 9.x أو أحدث

### **التثبيت السريع**

#### **الطريقة الأولى: التشغيل المباشر**
```bash
# 1. استنساخ المشروع
git clone https://github.com/your-org/echoops-crm.git
cd echoops-crm

# 2. تشغيل ملف الإعداد الشامل
chmod +x RUN_PROJECT.sh
./RUN_PROJECT.sh

# 3. تشغيل المشروع
./start-all.sh
```

#### **الطريقة الثانية: Docker (مستحسن)**
```bash
# 1. استنساخ المشروع
git clone https://github.com/your-org/echoops-crm.git
cd echoops-crm

# 2. تشغيل باستخدام Docker
chmod +x DOCKER_RUN.sh
./DOCKER_RUN.sh
```

### **البيانات التجريبية**
| النوع | البريد الإلكتروني | كلمة المرور | الصلاحيات |
|-------|-------------------|--------------|-----------|
| Super Admin | `admin@echoops.com` | `Admin123!` | كاملة |
| Company Admin | `company-admin@echoops.com` | `Admin123!` | إدارة الشركة |
| Sales Agent | `agent@echoops.com` | `Admin123!` | المبيعات |

---

## 🏗️ **الهيكل التقني**

### **Backend Stack**
- **Framework**: NestJS 10.x + TypeScript 5.x
- **Database**: MySQL 8.x + TypeORM 0.3.x
- **Authentication**: JWT + Passport + Role-Based Access Control
- **Security**: Row-Level Security (RLS) + Permissions System
- **Testing**: Jest + Supertest

### **Frontend Stack**
- **Framework**: React 18.x + TypeScript 5.x
- **Styling**: Tailwind CSS 3.x + Shadcn/ui
- **State Management**: React Query (TanStack Query)
- **Internationalization**: react-i18next
- **Testing**: Jest + React Testing Library

### **DevOps & Tools**
- **Package Manager**: npm
- **Containerization**: Docker + Docker Compose
- **Process Manager**: PM2
- **Web Server**: Nginx
- **SSL**: Let's Encrypt

---

## 📁 **هيكل المشروع**

```
echoops-crm/
├── backend/                 # الواجهة الخلفية (NestJS)
│   ├── src/
│   │   ├── auth/           # نظام المصادقة
│   │   ├── users/          # إدارة المستخدمين
│   │   ├── companies/      # إدارة الشركات
│   │   ├── developers/     # إدارة المطورين
│   │   ├── projects/       # إدارة المشاريع
│   │   ├── properties/     # إدارة الوحدات العقارية
│   │   ├── leads/          # إدارة العملاء المحتملين
│   │   ├── deals/          # إدارة الصفقات
│   │   ├── activities/     # إدارة الأنشطة
│   │   ├── analytics/      # التحليلات والتقارير
│   │   ├── notifications/  # نظام الإشعارات
│   │   ├── payments/       # إدارة المدفوعات
│   │   └── database/       # قاعدة البيانات (Migrations + Seeders)
│   └── package.json
├── frontend/                # الواجهة الأمامية (React)
│   ├── src/
│   │   ├── components/     # مكونات React
│   │   ├── pages/          # صفحات التطبيق
│   │   ├── hooks/          # React Hooks
│   │   ├── contexts/       # React Contexts
│   │   ├── lib/            # مكتبات مساعدة
│   │   └── locales/        # ملفات الترجمة
│   └── package.json
├── docker-compose.yml       # تكوين Docker
├── nginx.conf               # إعدادات Nginx
└── README.md
```

---

## 🔐 **نظام الصلاحيات**

### **الأدوار المتاحة**
1. **SUPER_ADMIN** 🚀: جميع الصلاحيات في النظام
2. **COMPANY_ADMIN** 👑: إدارة الشركة والمستخدمين
3. **MANAGER** 📋: إدارة الفريق والمشاريع
4. **AGENT** 💼: إدارة العملاء والصفقات
5. **VIEWER** 👁️: عرض البيانات والتقارير فقط

### **الصلاحيات المتاحة**
- **إدارة المستخدمين**: إنشاء، قراءة، تحديث، حذف
- **إدارة المطورين**: إدارة كاملة للمطورين
- **إدارة المشاريع**: إدارة كاملة للمشاريع
- **إدارة الوحدات**: إدارة كاملة للوحدات العقارية
- **إدارة العملاء**: إدارة كاملة للعملاء المحتملين
- **إدارة الصفقات**: إدارة كاملة للصفقات
- **إدارة الأنشطة**: إدارة كاملة للأنشطة
- **التقارير**: عرض التحليلات والتقارير
- **الإشعارات**: إدارة نظام الإشعارات
- **المدفوعات**: إدارة المدفوعات والاشتراكات

---

## 📊 **الميزات المتقدمة**

### **إدارة المطورين والمشاريع**
- ✅ إنشاء وإدارة المطورين
- ✅ إنشاء وإدارة المشاريع
- ✅ ربط المشاريع بالمطورين
- ✅ تتبع مراحل المشاريع
- ✅ إدارة معالم المشاريع

### **إدارة الوحدات العقارية**
- ✅ إنشاء وإدارة الوحدات
- ✅ ربط الوحدات بالمشاريع
- ✅ إدارة أنواع الوحدات
- ✅ تتبع حالة الوحدات
- ✅ إدارة الصور والوسائط

### **إدارة العملاء والصفقات**
- ✅ إنشاء وإدارة العملاء المحتملين
- ✅ ربط العملاء بالوحدات
- ✅ إنشاء وإدارة الصفقات
- ✅ تتبع مراحل الصفقات
- ✅ إدارة العمولات

### **نظام الأنشطة**
- ✅ إنشاء وإدارة الأنشطة
- ✅ جدولة المهام والمواعيد
- ✅ تتبع حالة الأنشطة
- ✅ عرض التقويم
- ✅ إدارة الأولويات

### **التقارير والتحليلات**
- ✅ لوحة معلومات تفاعلية
- ✅ تقارير المبيعات
- ✅ تحليلات العملاء
- ✅ تقارير المشاريع
- ✅ فلاتر متقدمة

---

## 🧪 **الاختبارات**

### **Backend Tests**
```bash
cd backend
npm run test              # اختبارات الوحدة
npm run test:cov          # اختبارات مع التغطية
npm run test:e2e          # اختبارات التكامل
```

### **Frontend Tests**
```bash
cd frontend
npm run test              # اختبارات الوحدة
npm run test:coverage     # اختبارات مع التغطية
```

---

## 🚀 **النشر والإنتاج**

### **Docker Deployment**
```bash
# بناء وتشغيل النظام
docker-compose up -d

# مراقبة السجلات
docker-compose logs -f
```

### **PM2 Deployment**
```bash
# تشغيل Backend
cd backend
pm2 start ecosystem.config.js

# تشغيل Frontend
cd frontend
npm run build
pm2 serve dist 3001 --name "echoops-frontend"
```

---

## 📚 **التوثيق**

### **دليل المستخدم**
- [📖 دليل المستخدم الشامل](USER_MANUAL.md) - دليل مفصل لاستخدام النظام

### **دليل المطور**
- [👨‍💻 دليل المطور](DEVELOPER_GUIDE.md) - دليل تقني شامل للمطورين

### **توثيق API**
- [🔌 توثيق API](API_DOCUMENTATION.md) - توثيق شامل لجميع نقاط النهاية

---

## 🔧 **المساهمة في المشروع**

### **إرشادات المساهمة**
1. Fork المشروع
2. إنشاء فرع للميزة الجديدة (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push إلى الفرع (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

### **معايير الكود**
- استخدم TypeScript لجميع الملفات
- اتبع قواعد ESLint
- اكتب اختبارات لكل ميزة جديدة
- حدث التوثيق مع كل تغيير

---

## 🐛 **الإبلاغ عن المشاكل**

### **قنوات الإبلاغ**
- 🐛 [GitHub Issues](https://github.com/your-org/echoops-crm/issues) - للإبلاغ عن المشاكل
- 📧 [البريد الإلكتروني](mailto:support@echoops.com) - للدعم الفني
- 💬 [Discord](https://discord.gg/echoops) - للمجتمع

### **معلومات مطلوبة**
- وصف مفصل للمشكلة
- خطوات إعادة إنتاج المشكلة
- معلومات النظام (OS, Browser, Version)
- لقطات شاشة (إن أمكن)

---

## 📄 **الترخيص**

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

---

## 🙏 **شكر وتقدير**

### **المساهمون**
- [👨‍💻 اسم المطور](https://github.com/username) - Lead Developer
- [👩‍💻 اسم المطور](https://github.com/username) - Backend Developer
- [👨‍🎨 اسم المطور](https://github.com/username) - Frontend Developer

### **التقنيات المستخدمة**
- [NestJS](https://nestjs.com/) - Backend Framework
- [React](https://reactjs.org/) - Frontend Framework
- [TypeScript](https://www.typescriptlang.org/) - Programming Language
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
- [MySQL](https://www.mysql.com/) - Database

---

## 📞 **معلومات الاتصال**

### **فريق التطوير**
- **Lead Developer**: [اسم المطور](mailto:lead@echoops.com)
- **Backend Developer**: [اسم المطور](mailto:backend@echoops.com)
- **Frontend Developer**: [اسم المطور](mailto:frontend@echoops.com)

### **قنوات التواصل**
- 📧 **البريد الإلكتروني**: [info@echoops.com](mailto:info@echoops.com)
- 🌐 **الموقع الإلكتروني**: [https://echoops.com](https://echoops.com)
- 💬 **Discord**: [EchoOps Community](https://discord.gg/echoops)
- 📱 **WhatsApp**: [+966501234567](https://wa.me/966501234567)

---

## 🎉 **حالة المشروع**

### **نسبة الإنجاز: 100%** 🎊

**✅ مكتمل بالكامل:**
- إعداد بيئة التطوير
- تنفيذ كيان المطور
- تنفيذ كيان المشروع
- تعديل كيان الوحدة العقارية
- تعديل كيانات العملاء والصفقات
- تطبيق نظام الصلاحيات
- تطوير الواجهة الأمامية
- إنشاء الهجرات والبذور
- التوثيق الشامل
- اختبارات الوحدة والتكامل
- اختبارات النهاية إلى النهاية
- اختبارات الأمان الشاملة
- نظام Docker للتشغيل
- ملفات التشغيل التلقائية

---

## 🚀 **الخطوات التالية**

### **للمطورين**
1. **نشر المشروع** - إعداد بيئة الإنتاج
2. **إضافة ميزات جديدة** - اقترح وتحقق من الميزات الجديدة
3. **تحسينات الأداء** - راجع وتحسن استعلامات قاعدة البيانات
4. **التوسع** - إضافة وحدات جديدة حسب الحاجة

### **للمستخدمين**
1. **استخدم النظام** - جرب جميع الميزات في بيئة الإنتاج
2. **أبلغ عن المشاكل** - ساعد في تحسين النظام
3. **اقترح ميزات** - أخبرنا بما تحتاجه
4. **شارك تجربتك** - ساعد المستخدمين الآخرين

---

**🎯 هدفنا**: بناء أفضل نظام CRM للعقارات في المنطقة العربية

**🌟 رؤيتنا**: تمكين الشركات العقارية من النمو والتطور من خلال التكنولوجيا المتقدمة

---

**آخر تحديث**: ديسمبر 2024  
**الإصدار**: 1.0.0  
**الحالة**: مكتمل بالكامل وجاهز للإنتاج! 🎉

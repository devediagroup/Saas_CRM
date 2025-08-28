# CRM Strapi - نظام إدارة علاقات العملاء

## نظرة عامة

مشروع CRM متكامل مبني باستخدام Strapi كـ backend و React كـ frontend. يوفر النظام إدارة شاملة للعملاء والعقارات والصفقات والمبيعات.

## المميزات

### 🏢 إدارة الشركات
- إضافة وتعديل وحذف الشركات
- تتبع معلومات الاتصال
- إدارة العناوين والتفاصيل

### 🏠 إدارة العقارات
- كتالوج شامل للعقارات
- صور وتفاصيل مفصلة
- حالة العقار (متاح، مباع، محجوز)

### 💼 إدارة الصفقات
- تتبع الصفقات من البداية للنهاية
- مراحل البيع المختلفة
- تقارير وإحصائيات

### 👥 إدارة العملاء
- قاعدة بيانات شاملة للعملاء
- تاريخ التعاملات
- تفضيلات واحتياجات

### 📊 التحليلات والتقارير
- لوحة تحكم تفاعلية
- إحصائيات المبيعات
- تقارير الأداء

### 🔐 الأمان والمصادقة
- نظام تسجيل دخول آمن
- صلاحيات مختلفة للمستخدمين
- تشفير البيانات

## التقنيات المستخدمة

### Backend
- **Strapi** - CMS headless
- **Node.js** - بيئة التشغيل
- **PostgreSQL** - قاعدة البيانات
- **JWT** - المصادقة
- **TypeScript** - لغة البرمجة

### Frontend
- **React 18** - مكتبة واجهة المستخدم
- **TypeScript** - لغة البرمجة
- **Tailwind CSS** - إطار العمل
- **React Router** - التنقل
- **React Query** - إدارة الحالة

### DevOps
- **Docker** - الحاويات
- **Nginx** - خادم الويب
- **PM2** - إدارة العمليات

## متطلبات النظام

- Node.js 18+
- PostgreSQL 14+
- Docker (اختياري)
- Git

## التثبيت والتشغيل

### 1. استنساخ المشروع
```bash
git clone https://github.com/devediagroup/Saas_CRM.git
cd Saas_CRM
```

### 2. تثبيت التبعيات
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. إعداد قاعدة البيانات
```bash
# إنشاء قاعدة البيانات
createdb crm_strapi

# تشغيل الهجرات
cd backend
npm run migration:run
```

### 4. تشغيل المشروع
```bash
# Backend (في terminal منفصل)
cd backend
npm run start:dev

# Frontend (في terminal منفصل)
cd frontend
npm run dev
```

### 5. استخدام Docker
```bash
docker-compose up -d
```

## هيكل المشروع

```
crm-strapi/
├── backend/                 # Strapi backend
│   ├── src/
│   │   ├── api/            # APIs
│   │   ├── components/     # المكونات
│   │   ├── config/         # الإعدادات
│   │   └── database/       # قاعدة البيانات
│   ├── package.json
│   └── Dockerfile
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/     # مكونات React
│   │   ├── pages/          # صفحات التطبيق
│   │   ├── hooks/          # React hooks
│   │   └── lib/            # المكتبات المساعدة
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
└── README.md
```

## API Endpoints

### المصادقة
- `POST /api/auth/local/register` - تسجيل مستخدم جديد
- `POST /api/auth/local` - تسجيل الدخول
- `GET /api/users/me` - معلومات المستخدم الحالي

### الشركات
- `GET /api/companies` - قائمة الشركات
- `POST /api/companies` - إضافة شركة جديدة
- `PUT /api/companies/:id` - تحديث شركة
- `DELETE /api/companies/:id` - حذف شركة

### العقارات
- `GET /api/properties` - قائمة العقارات
- `POST /api/properties` - إضافة عقار جديد
- `PUT /api/properties/:id` - تحديث عقار
- `DELETE /api/properties/:id` - حذف عقار

### الصفقات
- `GET /api/deals` - قائمة الصفقات
- `POST /api/deals` - إضافة صفقة جديدة
- `PUT /api/deals/:id` - تحديث صفقة
- `DELETE /api/deals/:id` - حذف صفقة

## المساهمة

نرحب بمساهماتكم! يرجى اتباع الخطوات التالية:

1. Fork المشروع
2. إنشاء branch جديد (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push إلى Branch (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

## الترخيص

هذا المشروع مرخص تحت رخصة MIT. راجع ملف `LICENSE` للتفاصيل.

## الدعم

إذا واجهت أي مشاكل أو لديك أسئلة:

- افتح Issue جديد
- تواصل معنا عبر البريد الإلكتروني
- راجع الوثائق

## المساهمون

- فريق DevEdia Group
- المساهمون من المجتمع

---

**ملاحظة**: هذا المشروع قيد التطوير النشط. قد تتغير بعض الميزات والواجهات مع التحديثات المستقبلية.

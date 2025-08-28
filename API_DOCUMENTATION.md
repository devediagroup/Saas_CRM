# 🔧 EchoOps CRM API Documentation

## 📋 جدول المحتويات

- [نظرة عامة على API](#-نظرة-عامة-على-api)
- [المصادقة](#-المصادقة)
- [إدارة الشركات](#-إدارة-الشركات)
- [إدارة المستخدمين](#-إدارة-المستخدمين)
- [إدارة العملاء المحتملين](#-إدارة-العملاء-المحتملين)
- [إدارة العقارات](#-إدارة-العقارات)
- [إدارة الصفقات](#-إدارة-الصفقات)
- [إدارة الأنشطة](#-إدارة-الأنشطة)
- [تكامل WhatsApp](#-تكامل-whatsapp)
- [نظام الإشعارات](#-نظام-الإشعارات)
- [الذكاء الاصطناعي](#-الذكاء-الاصطناعي)
- [نظام الدفع](#-نظام-الدفع)
- [الأخطاء والاستثناءات](#-الأخطاء-والاستثناءات)

---

## 🌐 نظرة عامة على API

### البناء الأساسي

```
Base URL: http://localhost:3000/api
Content-Type: application/json
```

### إصدارات API

- **Current Version**: v1.0.0
- **Supported Versions**: v1.0
- **Response Format**: JSON
- **Encoding**: UTF-8

### معايير التصميم

- **RESTful Design**: اتباع مبادئ REST
- **HTTP Methods**: GET, POST, PUT, DELETE
- **Status Codes**: معايير HTTP
- **Pagination**: Cursor-based pagination
- **Filtering**: Query parameters
- **Sorting**: Field-based sorting

---

## 🔐 المصادقة

### تسجيل الدخول

#### Request
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Response
```json
{
  "statusCode": 200,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "first_name": "الاسم الأول",
      "last_name": "الاسم الأخير",
      "role": "sales_agent",
      "company_id": "company-uuid",
      "status": "active"
    }
  },
  "message": "تم تسجيل الدخول بنجاح"
}
```

### تسجيل حساب جديد

#### Request
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "first_name": "أحمد",
  "last_name": "محمد",
  "company_name": "شركة العقارات"
}
```

#### Response
```json
{
  "statusCode": 201,
  "data": {
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "first_name": "أحمد",
      "last_name": "محمد",
      "role": "company_admin",
      "company_id": "company-uuid",
      "status": "active"
    },
    "company": {
      "id": "company-uuid",
      "name": "شركة العقارات",
      "subdomain": "sharikat-al-aqarat",
      "email": "user@example.com"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "تم إنشاء الحساب بنجاح"
}
```

### التحقق من المستخدم الحالي

#### Request
```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

#### Response
```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid-string",
    "email": "user@example.com",
    "first_name": "أحمد",
    "last_name": "محمد",
    "role": "sales_agent",
    "company_id": "company-uuid",
    "company": {
      "id": "company-uuid",
      "name": "شركة العقارات",
      "subdomain": "sharikat-al-aqarat"
    },
    "permissions": ["leads.read", "leads.write", "properties.read"]
  }
}
```

### تحديث الملف الشخصي

#### Request
```http
PUT /api/auth/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "first_name": "أحمد المحدث",
  "phone": "+966501234567"
}
```

#### Response
```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid-string",
    "email": "user@example.com",
    "first_name": "أحمد المحدث",
    "last_name": "محمد",
    "phone": "+966501234567"
  },
  "message": "تم تحديث الملف الشخصي بنجاح"
}
```

### تغيير كلمة المرور

#### Request
```http
PUT /api/auth/change-password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "current_password": "CurrentPass123!",
  "new_password": "NewSecurePass123!",
  "confirm_password": "NewSecurePass123!"
}
```

#### Response
```json
{
  "statusCode": 200,
  "message": "تم تغيير كلمة المرور بنجاح"
}
```

### تحديث التوكن

#### Request
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response
```json
{
  "statusCode": 200,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 🏢 إدارة الشركات

### قائمة الشركات

#### Request
```http
GET /api/companies?page=1&limit=10&sort=name:asc
Authorization: Bearer <access_token>
```

#### Response
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "uuid-string",
      "name": "شركة العقارات الأولى",
      "subdomain": "first-company",
      "email": "info@first.com",
      "phone": "+966501234567",
      "address": "الرياض، المملكة العربية السعودية",
      "website": "https://first.com",
      "logo_url": "https://cdn.example.com/logos/first.png",
      "status": "active",
      "subscription_plan": "pro",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "total_pages": 1
  }
}
```

### إنشاء شركة جديدة

#### Request
```http
POST /api/companies
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "شركة العقارات الجديدة",
  "email": "info@newcompany.com",
  "phone": "+966507654321",
  "address": "جدة، المملكة العربية السعودية",
  "website": "https://newcompany.com"
}
```

#### Response
```json
{
  "statusCode": 201,
  "data": {
    "id": "uuid-string",
    "name": "شركة العقارات الجديدة",
    "subdomain": "sharikat-al-aqarat-al-jadida",
    "email": "info@newcompany.com",
    "phone": "+966507654321",
    "address": "جدة، المملكة العربية السعودية",
    "website": "https://newcompany.com",
    "status": "active",
    "subscription_plan": "free",
    "created_at": "2024-12-01T00:00:00Z",
    "updated_at": "2024-12-01T00:00:00Z"
  },
  "message": "تم إنشاء الشركة بنجاح"
}
```

### تحديث الشركة

#### Request
```http
PUT /api/companies/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "شركة العقارات المحدثة",
  "phone": "+966509876543"
}
```

#### Response
```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid-string",
    "name": "شركة العقارات المحدثة",
    "subdomain": "sharikat-al-aqarat-al-jadida",
    "email": "info@newcompany.com",
    "phone": "+966509876543",
    "address": "جدة، المملكة العربية السعودية",
    "website": "https://newcompany.com",
    "status": "active",
    "updated_at": "2024-12-01T00:00:00Z"
  },
  "message": "تم تحديث الشركة بنجاح"
}
```

---

## 👥 إدارة المستخدمين

### قائمة المستخدمين

#### Request
```http
GET /api/users?page=1&limit=10&sort=first_name:asc
Authorization: Bearer <access_token>
```

#### Parameters
- `page`: رقم الصفحة (افتراضي: 1)
- `limit`: عدد العناصر لكل صفحة (افتراضي: 10)
- `sort`: الترتيب (مثال: `first_name:asc`, `created_at:desc`)
- `role`: فلترة حسب الدور
- `status`: فلترة حسب الحالة

#### Response
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "uuid-string",
      "email": "user@example.com",
      "first_name": "أحمد",
      "last_name": "محمد",
      "phone": "+966501234567",
      "role": "sales_agent",
      "status": "active",
      "company_id": "company-uuid",
      "company": {
        "id": "company-uuid",
        "name": "شركة العقارات"
      },
      "last_login": "2024-12-01T10:30:00Z",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-12-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "total_pages": 1
  }
}
```

### إضافة مستخدم جديد

#### Request
```http
POST /api/users
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "first_name": "فاطمة",
  "last_name": "أحمد",
  "phone": "+966507654321",
  "role": "sales_agent"
}
```

#### Response
```json
{
  "statusCode": 201,
  "data": {
    "id": "uuid-string",
    "email": "newuser@example.com",
    "first_name": "فاطمة",
    "last_name": "أحمد",
    "phone": "+966507654321",
    "role": "sales_agent",
    "status": "active",
    "company_id": "company-uuid",
    "created_at": "2024-12-01T00:00:00Z"
  },
  "message": "تم إضافة المستخدم بنجاح"
}
```

### تحديث المستخدم

#### Request
```http
PUT /api/users/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "first_name": "فاطمة المحدثة",
  "role": "sales_manager",
  "status": "active"
}
```

#### Response
```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid-string",
    "email": "newuser@example.com",
    "first_name": "فاطمة المحدثة",
    "last_name": "أحمد",
    "phone": "+966507654321",
    "role": "sales_manager",
    "status": "active",
    "updated_at": "2024-12-01T00:00:00Z"
  },
  "message": "تم تحديث المستخدم بنجاح"
}
```

### حذف المستخدم

#### Request
```http
DELETE /api/users/:id
Authorization: Bearer <access_token>
```

#### Response
```json
{
  "statusCode": 200,
  "message": "تم حذف المستخدم بنجاح"
}
```

### إدارة الأدوار والصلاحيات

#### قائمة الأدوار
```http
GET /api/roles
Authorization: Bearer <access_token>
```

#### Response
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "uuid-string",
      "name": "super_admin",
      "display_name": "مدير النظام",
      "description": "صلاحيات كاملة على النظام",
      "permissions": [
        "companies.*",
        "users.*",
        "leads.*",
        "properties.*",
        "deals.*",
        "activities.*"
      ]
    },
    {
      "id": "uuid-string",
      "name": "company_admin",
      "display_name": "مدير الشركة",
      "description": "إدارة الشركة والمستخدمين",
      "permissions": [
        "users.read",
        "users.write",
        "leads.*",
        "properties.*",
        "deals.*",
        "activities.*"
      ]
    }
  ]
}
```

---

## 🎯 إدارة العملاء المحتملين

### قائمة العملاء المحتملين

#### Request
```http
GET /api/leads?page=1&limit=10&sort=created_at:desc
Authorization: Bearer <access_token>
```

#### Parameters
- `page`: رقم الصفحة
- `limit`: عدد العناصر
- `sort`: الترتيب
- `status`: فلترة حسب الحالة
- `priority`: فلترة حسب الأولوية
- `source`: فلترة حسب المصدر
- `assigned_to`: فلترة حسب المسؤول

#### Response
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "uuid-string",
      "first_name": "محمد",
      "last_name": "أحمد",
      "email": "mohammed@example.com",
      "phone": "+966501234567",
      "company": "شركة محمد",
      "budget_min": 300000,
      "budget_max": 800000,
      "preferred_location": "الرياض",
      "property_type_preference": "apartment",
      "timeline": "3_months",
      "status": "qualified",
      "priority": "high",
      "source": "website",
      "notes": "عميل جاد يبحث عن شقة في الرياض",
      "assigned_to": "user-uuid",
      "company_id": "company-uuid",
      "ai_score": 85,
      "ai_recommendations": [
        "اتصل بالعميل خلال 24 ساعة",
        "اعرض شقق في حي العليا",
        "اقترح جولة في عطلة نهاية الأسبوع"
      ],
      "created_at": "2024-12-01T00:00:00Z",
      "updated_at": "2024-12-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "total_pages": 1
  }
}
```

### إضافة عميل محتمل جديد

#### Request
```http
POST /api/leads
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "first_name": "سارة",
  "last_name": "خالد",
  "email": "sara@example.com",
  "phone": "+966507654321",
  "company": "شركة سارة",
  "budget_min": 500000,
  "budget_max": 1000000,
  "preferred_location": "جدة",
  "property_type_preference": "villa",
  "timeline": "6_months",
  "status": "new",
  "priority": "medium",
  "source": "facebook",
  "notes": "عميل مهتم بفيلا في جدة"
}
```

#### Response
```json
{
  "statusCode": 201,
  "data": {
    "id": "uuid-string",
    "first_name": "سارة",
    "last_name": "خالد",
    "email": "sara@example.com",
    "phone": "+966507654321",
    "company": "شركة سارة",
    "budget_min": 500000,
    "budget_max": 1000000,
    "preferred_location": "جدة",
    "property_type_preference": "villa",
    "timeline": "6_months",
    "status": "new",
    "priority": "medium",
    "source": "facebook",
    "notes": "عميل مهتم بفيلا في جدة",
    "company_id": "company-uuid",
    "ai_score": 72,
    "created_at": "2024-12-01T00:00:00Z"
  },
  "message": "تم إضافة العميل المحتمل بنجاح"
}
```

### تحديث العميل المحتمل

#### Request
```http
PUT /api/leads/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "qualified",
  "priority": "high",
  "notes": "تم التواصل وأبدى اهتماماً كبيراً"
}
```

#### Response
```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid-string",
    "first_name": "سارة",
    "last_name": "خالد",
    "email": "sara@example.com",
    "status": "qualified",
    "priority": "high",
    "notes": "تم التواصل وأبدى اهتماماً كبيراً",
    "updated_at": "2024-12-01T00:00:00Z"
  },
  "message": "تم تحديث العميل المحتمل بنجاح"
}
```

### حذف العميل المحتمل

#### Request
```http
DELETE /api/leads/:id
Authorization: Bearer <access_token>
```

#### Response
```json
{
  "statusCode": 200,
  "message": "تم حذف العميل المحتمل بنجاح"
}
```

### AI Scoring للعملاء

#### Request
```http
GET /api/leads/:id/scoring
Authorization: Bearer <access_token>
```

#### Response
```json
{
  "statusCode": 200,
  "data": {
    "lead_id": "uuid-string",
    "overall_score": 85,
    "scores": {
      "engagement": 90,
      "budget": 80,
      "timeline": 85,
      "source": 88,
      "property_interest": 82
    },
    "recommendations": [
      "اتصل بالعميل خلال 24 ساعة",
      "اعرض خيارات في الميزانية المحددة",
      "ركز على الموقع المفضل"
    ],
    "risk_factors": [
      "المنافسة عالية في المنطقة",
      "العميل يحتاج وقت للقرار"
    ]
  }
}
```

### إحصائيات العملاء المحتملين

#### Request
```http
GET /api/leads/statistics
Authorization: Bearer <access_token>
```

#### Response
```json
{
  "statusCode": 200,
  "data": {
    "total_leads": 150,
    "status_distribution": {
      "new": 25,
      "contacted": 30,
      "qualified": 45,
      "proposal": 20,
      "negotiation": 15,
      "closed": 10,
      "lost": 5
    },
    "source_distribution": {
      "website": 40,
      "facebook": 30,
      "referral": 20,
      "direct": 10
    },
    "priority_distribution": {
      "high": 20,
      "medium": 80,
      "low": 50
    },
    "conversion_rate": 15.5,
    "average_score": 78
  }
}
```

---

## 🏠 إدارة العقارات

### قائمة العقارات

#### Request
```http
GET /api/properties?page=1&limit=10&sort=created_at:desc
Authorization: Bearer <access_token>
```

#### Parameters
- `property_type`: نوع العقار (apartment, villa, office, shop, land, warehouse)
- `status`: الحالة (available, sold, rented, under_contract)
- `min_price`: السعر الأدنى
- `max_price`: السعر الأعلى
- `city`: المدينة
- `district`: الحي
- `bedrooms`: عدد غرف النوم
- `bathrooms`: عدد الحمامات

#### Response
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "uuid-string",
      "title": "شقة فاخرة في حي العليا",
      "description": "شقة مكونة من 3 غرف وصالة ومطبخ و3 حمامات",
      "property_type": "apartment",
      "price": 650000,
      "currency": "SAR",
      "city": "الرياض",
      "district": "العليا",
      "address": "شارع الملك فهد، حي العليا",
      "coordinates": {
        "latitude": 24.7136,
        "longitude": 46.6753
      },
      "bedrooms": 3,
      "bathrooms": 3,
      "area_sqm": 180,
      "parking_spaces": 1,
      "floor_number": 5,
      "total_floors": 12,
      "year_built": 2020,
      "furnished": false,
      "features": [
        "مصعد",
        "أمان 24/7",
        "مسابح",
        "حدائق",
        "قرب من المساجد",
        "قرب من المدارس"
      ],
      "images": [
        {
          "id": "image-uuid",
          "url": "https://cdn.example.com/properties/1/main.jpg",
          "alt": "صورة الشقة الرئيسية",
          "is_main": true
        }
      ],
      "status": "available",
      "company_id": "company-uuid",
      "view_count": 125,
      "inquiry_count": 8,
      "is_featured": true,
      "created_at": "2024-12-01T00:00:00Z",
      "updated_at": "2024-12-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "total_pages": 1
  }
}
```

### إضافة عقار جديد

#### Request
```http
POST /api/properties
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "فيلا راقية في حي الروضة",
  "description": "فيلا مستقلة مع حديقة خاصة وحمام سباحة",
  "property_type": "villa",
  "price": 2500000,
  "currency": "SAR",
  "city": "الرياض",
  "district": "الروضة",
  "address": "شارع الملك عبدالعزيز، حي الروضة",
  "bedrooms": 5,
  "bathrooms": 4,
  "area_sqm": 450,
  "parking_spaces": 2,
  "year_built": 2019,
  "features": [
    "حديقة خاصة",
    "حمام سباحة",
    "غرفة خادمة",
    "مطبخ مفتوح",
    "أرضيات رخامية"
  ],
  "images": [
    {
      "url": "https://cdn.example.com/properties/villa1.jpg",
      "alt": "صورة الفيلا الخارجية",
      "is_main": true
    }
  ]
}
```

#### Response
```json
{
  "statusCode": 201,
  "data": {
    "id": "uuid-string",
    "title": "فيلا راقية في حي الروضة",
    "description": "فيلا مستقلة مع حديقة خاصة وحمام سباحة",
    "property_type": "villa",
    "price": 2500000,
    "status": "available",
    "company_id": "company-uuid",
    "view_count": 0,
    "inquiry_count": 0,
    "is_featured": false,
    "created_at": "2024-12-01T00:00:00Z"
  },
  "message": "تم إضافة العقار بنجاح"
}
```

### تحديث العقار

#### Request
```http
PUT /api/properties/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "price": 2400000,
  "status": "under_contract",
  "features": [
    "حديقة خاصة",
    "حمام سباحة",
    "غرفة خادمة",
    "مطبخ مفتوح",
    "أرضيات رخامية",
    "نظام أمان ذكي"
  ]
}
```

#### Response
```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid-string",
    "title": "فيلا راقية في حي الروضة",
    "price": 2400000,
    "status": "under_contract",
    "features": [
      "حديقة خاصة",
      "حمام سباحة",
      "غرفة خادمة",
      "مطبخ مفتوح",
      "أرضيات رخامية",
      "نظام أمان ذكي"
    ],
    "updated_at": "2024-12-01T00:00:00Z"
  },
  "message": "تم تحديث العقار بنجاح"
}
```

### إحصائيات العقارات

#### Request
```http
GET /api/properties/statistics
Authorization: Bearer <access_token>
```

#### Response
```json
{
  "statusCode": 200,
  "data": {
    "total_properties": 25,
    "status_distribution": {
      "available": 18,
      "sold": 4,
      "rented": 2,
      "under_contract": 1
    },
    "type_distribution": {
      "apartment": 12,
      "villa": 8,
      "office": 3,
      "shop": 1,
      "land": 1
    },
    "price_ranges": {
      "0-500k": 8,
      "500k-1M": 10,
      "1M-2M": 4,
      "2M+": 3
    },
    "average_price": 1250000,
    "total_value": 31250000,
    "average_views": 45,
    "average_inquiries": 3.2
  }
}
```

### رفع الصور

#### Request
```http
POST /api/properties/:id/images
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

{
  "images": [file1.jpg, file2.jpg],
  "alt_text": "صور العقار",
  "is_main": false
}
```

#### Response
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "image-uuid-1",
      "url": "https://cdn.example.com/properties/1/image1.jpg",
      "alt": "صور العقار",
      "is_main": false
    },
    {
      "id": "image-uuid-2",
      "url": "https://cdn.example.com/properties/1/image2.jpg",
      "alt": "صور العقار",
      "is_main": false
    }
  ],
  "message": "تم رفع الصور بنجاح"
}
```

---

## 💼 إدارة الصفقات

### قائمة الصفقات

#### Request
```http
GET /api/deals?page=1&limit=10&sort=created_at:desc
Authorization: Bearer <access_token>
```

#### Parameters
- `stage`: مرحلة الصفقة
- `status`: حالة الصفقة
- `assigned_to`: المسؤول عن الصفقة
- `min_amount`: المبلغ الأدنى
- `max_amount`: المبلغ الأعلى

#### Response
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "uuid-string",
      "title": "بيع شقة في حي العليا",
      "description": "صفقة بيع شقة 3 غرف في حي العليا",
      "stage": "negotiation",
      "status": "active",
      "amount": 650000,
      "currency": "SAR",
      "probability": 75,
      "expected_close_date": "2024-12-15",
      "actual_close_date": null,
      "commission_percentage": 2.5,
      "commission_amount": 16250,
      "lead_id": "lead-uuid",
      "property_id": "property-uuid",
      "assigned_to": "user-uuid",
      "company_id": "company-uuid",
      "lead": {
        "id": "lead-uuid",
        "first_name": "أحمد",
        "last_name": "محمد",
        "email": "ahmed@example.com"
      },
      "property": {
        "id": "property-uuid",
        "title": "شقة فاخرة في حي العليا",
        "price": 650000
      },
      "notes": [
        {
          "id": "note-uuid",
          "content": "العميل مهتم لكن يطلب خصم 2%",
          "created_by": "user-uuid",
          "created_at": "2024-12-01T00:00:00Z"
        }
      ],
      "created_at": "2024-12-01T00:00:00Z",
      "updated_at": "2024-12-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "total_pages": 1
  }
}
```

### إنشاء صفقة جديدة

#### Request
```http
POST /api/deals
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "بيع فيلا في حي الروضة",
  "description": "صفقة بيع فيلا 5 غرف في حي الروضة",
  "amount": 2500000,
  "currency": "SAR",
  "probability": 60,
  "expected_close_date": "2024-12-30",
  "commission_percentage": 3.0,
  "lead_id": "lead-uuid",
  "property_id": "property-uuid",
  "assigned_to": "user-uuid",
  "notes": "عميل جاد يريد إغلاق سريع"
}
```

#### Response
```json
{
  "statusCode": 201,
  "data": {
    "id": "uuid-string",
    "title": "بيع فيلا في حي الروضة",
    "stage": "initial_inquiry",
    "status": "active",
    "amount": 2500000,
    "probability": 60,
    "commission_amount": 75000,
    "created_at": "2024-12-01T00:00:00Z"
  },
  "message": "تم إنشاء الصفقة بنجاح"
}
```

### تحديث الصفقة

#### Request
```http
PUT /api/deals/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "stage": "proposal_submitted",
  "probability": 80,
  "amount": 2400000,
  "notes": "تم تقديم العرض المحدث مع خصم 4%"
}
```

#### Response
```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid-string",
    "stage": "proposal_submitted",
    "probability": 80,
    "amount": 2400000,
    "updated_at": "2024-12-01T00:00:00Z"
  },
  "message": "تم تحديث الصفقة بنجاح"
}
```

### إحصائيات الصفقات

#### Request
```http
GET /api/deals/statistics
Authorization: Bearer <access_token>
```

#### Response
```json
{
  "statusCode": 200,
  "data": {
    "total_deals": 45,
    "stage_distribution": {
      "initial_inquiry": 12,
      "property_showing": 8,
      "proposal_submitted": 10,
      "negotiation": 8,
      "initial_agreement": 4,
      "deal_closed": 3
    },
    "status_distribution": {
      "active": 42,
      "won": 3,
      "lost": 0
    },
    "total_value": 25000000,
    "average_deal_size": 555556,
    "total_commission": 625000,
    "conversion_rate": 6.7,
    "average_sales_cycle": 45,
    "forecast_revenue": 3500000
  }
}
```

---

## 📅 إدارة الأنشطة

### قائمة الأنشطة

#### Request
```http
GET /api/activities?page=1&limit=10&sort=due_date:asc
Authorization: Bearer <access_token>
```

#### Parameters
- `type`: نوع النشاط
- `status`: الحالة
- `assigned_to`: المسؤول
- `lead_id`: مرتبط بعميل معين
- `date_from`: من تاريخ
- `date_to`: إلى تاريخ

#### Response
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "uuid-string",
      "type": "meeting",
      "title": "جولة في الشقة",
      "description": "جولة مع العميل في شقة حي العليا",
      "status": "scheduled",
      "priority": "high",
      "due_date": "2024-12-05T14:00:00Z",
      "duration_minutes": 90,
      "location": "شقة رقم 501، برج الرياض، حي العليا",
      "assigned_to": "user-uuid",
      "lead_id": "lead-uuid",
      "property_id": "property-uuid",
      "company_id": "company-uuid",
      "lead": {
        "id": "lead-uuid",
        "first_name": "أحمد",
        "last_name": "محمد"
      },
      "property": {
        "id": "property-uuid",
        "title": "شقة فاخرة في حي العليا"
      },
      "reminders": [
        {
          "id": "reminder-uuid",
          "type": "email",
          "minutes_before": 60,
          "sent": false
        }
      ],
      "outcome": null,
      "notes": "",
      "created_at": "2024-12-01T00:00:00Z",
      "updated_at": "2024-12-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "total_pages": 1
  }
}
```

### إنشاء نشاط جديد

#### Request
```http
POST /api/activities
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "type": "call",
  "title": "متابعة العميل",
  "description": "مكالمة متابعة مع العميل حول الشقة",
  "priority": "medium",
  "due_date": "2024-12-10T10:30:00Z",
  "duration_minutes": 30,
  "assigned_to": "user-uuid",
  "lead_id": "lead-uuid",
  "property_id": "property-uuid",
  "reminders": [
    {
      "type": "notification",
      "minutes_before": 15
    }
  ]
}
```

#### Response
```json
{
  "statusCode": 201,
  "data": {
    "id": "uuid-string",
    "type": "call",
    "title": "متابعة العميل",
    "status": "scheduled",
    "created_at": "2024-12-01T00:00:00Z"
  },
  "message": "تم إنشاء النشاط بنجاح"
}
```

### تحديث النشاط

#### Request
```http
PUT /api/activities/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "completed",
  "outcome": "successful",
  "notes": "تم الاتفاق على جولة يوم الجمعة المقبل"
}
```

#### Response
```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid-string",
    "status": "completed",
    "outcome": "successful",
    "notes": "تم الاتفاق على جولة يوم الجمعة المقبل",
    "updated_at": "2024-12-01T00:00:00Z"
  },
  "message": "تم تحديث النشاط بنجاح"
}
```

### إحصائيات الأنشطة

#### Request
```http
GET /api/activities/statistics
Authorization: Bearer <access_token>
```

#### Response
```json
{
  "statusCode": 200,
  "data": {
    "total_activities": 120,
    "type_distribution": {
      "call": 45,
      "email": 30,
      "meeting": 25,
      "whatsapp": 15,
      "note": 5
    },
    "status_distribution": {
      "scheduled": 40,
      "completed": 60,
      "cancelled": 15,
      "overdue": 5
    },
    "completion_rate": 83.3,
    "average_duration": 45,
    "overdue_rate": 4.2,
    "upcoming_today": 8,
    "upcoming_week": 25
  }
}
```

### عرض التقويم

#### Request
```http
GET /api/activities/calendar?month=12&year=2024
Authorization: Bearer <access_token>
```

#### Response
```json
{
  "statusCode": 200,
  "data": {
    "month": 12,
    "year": 2024,
    "days": [
      {
        "date": "2024-12-01",
        "activities": [
          {
            "id": "activity-uuid",
            "title": "جولة في الشقة",
            "type": "meeting",
            "time": "14:00",
            "duration": 90,
            "status": "scheduled"
          }
        ]
      }
    ]
  }
}
```

---

## 💬 تكامل WhatsApp

### إعداد WhatsApp Business API

#### Request
```http
POST /api/whatsapp/setup
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "api_key": "your-whatsapp-api-key",
  "phone_number_id": "your-phone-number-id",
  "webhook_url": "https://yourdomain.com/api/whatsapp/webhook",
  "verify_token": "your-verify-token"
}
```

#### Response
```json
{
  "statusCode": 200,
  "data": {
    "id": "whatsapp-config-uuid",
    "status": "active",
    "last_verified": "2024-12-01T00:00:00Z"
  },
  "message": "تم إعداد WhatsApp Business API بنجاح"
}
```

### إرسال رسالة

#### Request
```http
POST /api/whatsapp/messages
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "to": "+966501234567",
  "type": "text",
  "message": "مرحباً بك في شركتنا! كيف يمكننا مساعدتك اليوم؟",
  "lead_id": "lead-uuid"
}
```

#### Response
```json
{
  "statusCode": 200,
  "data": {
    "id": "message-uuid",
    "to": "+966501234567",
    "type": "text",
    "message": "مرحباً بك في شركتنا! كيف يمكننا مساعدتك اليوم؟",
    "status": "sent",
    "sent_at": "2024-12-01T00:00:00Z",
    "delivered_at": null,
    "read_at": null
  },
  "message": "تم إرسال الرسالة بنجاح"
}
```

### إرسال رسالة مع صورة

#### Request
```http
POST /api/whatsapp/messages
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "to": "+966501234567",
  "type": "image",
  "image_url": "https://cdn.example.com/properties/1/main.jpg",
  "caption": "شقة فاخرة في حي العليا - 650,000 ريال",
  "lead_id": "lead-uuid"
}
```

#### Response
```json
{
  "statusCode": 200,
  "data": {
    "id": "message-uuid",
    "to": "+966501234567",
    "type": "image",
    "image_url": "https://cdn.example.com/properties/1/main.jpg",
    "caption": "شقة فاخرة في حي العليا - 650,000 ريال",
    "status": "sent"
  },
  "message": "تم إرسال الصورة بنجاح"
}
```

### إرسال قوالب الرسائل

#### Request
```http
POST /api/whatsapp/templates
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "to": "+966501234567",
  "template_name": "welcome_message",
  "language_code": "ar",
  "components": [
    {
      "type": "body",
      "parameters": [
        {
          "type": "text",
          "text": "أحمد"
        }
      ]
    }
  ]
}
```

#### Response
```json
{
  "statusCode": 200,
  "data": {
    "id": "template-message-uuid",
    "template_name": "welcome_message",
    "status": "sent"
  },
  "message": "تم إرسال القالب بنجاح"
}
```

### تاريخ المحادثات

#### Request
```http
GET /api/whatsapp/chats?lead_id=lead-uuid
Authorization: Bearer <access_token>
```

#### Response
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "chat-uuid",
      "lead_id": "lead-uuid",
      "lead": {
        "first_name": "أحمد",
        "last_name": "محمد",
        "phone": "+966501234567"
      },
      "messages": [
        {
          "id": "message-uuid-1",
          "direction": "outbound",
          "type": "text",
          "message": "مرحباً بك في شركتنا!",
          "status": "delivered",
          "sent_at": "2024-12-01T10:00:00Z"
        },
        {
          "id": "message-uuid-2",
          "direction": "inbound",
          "type": "text",
          "message": "شكراً، أريد معلومات عن الشقق",
          "status": "received",
          "sent_at": "2024-12-01T10:05:00Z"
        }
      ],
      "last_message": "2024-12-01T10:05:00Z",
      "unread_count": 1
    }
  ]
}
```

### إحصائيات WhatsApp

#### Request
```http
GET /api/whatsapp/statistics
Authorization: Bearer <access_token>
```

#### Response
```json
{
  "statusCode": 200,
  "data": {
    "total_messages": 1250,
    "messages_today": 45,
    "delivery_rate": 98.5,
    "read_rate": 87.3,
    "response_rate": 72.1,
    "average_response_time": 15,
    "top_templates": [
      {
        "name": "welcome_message",
        "sent": 200,
        "delivered": 196,
        "read": 170
      }
    ],
    "active_chats": 25,
    "leads_converted": 8
  }
}
```

---

## 📧 نظام الإشعارات

### إرسال إشعار

#### Request
```http
POST /api/notifications
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "تذكير بمواعيد اليوم",
  "message": "لديك 5 مواعيد اليوم",
  "type": "reminder",
  "priority": "high",
  "user_id": "user-uuid",
  "data": {
    "action_url": "/activities?date=today",
    "activity_ids": ["activity-1", "activity-2"]
  }
}
```

#### Response
```json
{
  "statusCode": 201,
  "data": {
    "id": "notification-uuid",
    "title": "تذكير بمواعيد اليوم",
    "message": "لديك 5 مواعيد اليوم",
    "type": "reminder",
    "priority": "high",
    "status": "unread",
    "created_at": "2024-12-01T00:00:00Z"
  },
  "message": "تم إرسال الإشعار بنجاح"
}
```

### قائمة الإشعارات

#### Request
```http
GET /api/notifications?page=1&limit=20
Authorization: Bearer <access_token>
```

#### Response
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "notification-uuid",
      "title": "تذكير بمواعيد اليوم",
      "message": "لديك 5 مواعيد اليوم",
      "type": "reminder",
      "priority": "high",
      "status": "unread",
      "data": {
        "action_url": "/activities?date=today"
      },
      "created_at": "2024-12-01T08:00:00Z"
    }
  ],
  "meta": {
    "total": 1,
    "unread_count": 1,
    "page": 1,
    "limit": 20
  }
}
```

### تحديث حالة الإشعار

#### Request
```http
PUT /api/notifications/:id/mark-read
Authorization: Bearer <access_token>
```

#### Response
```json
{
  "statusCode": 200,
  "message": "تم تحديد الإشعار كمقروء"
}
```

### إحصائيات الإشعارات

#### Request
```http
GET /api/notifications/statistics
Authorization: Bearer <access_token>
```

#### Response
```json
{
  "statusCode": 200,
  "data": {
    "total_notifications": 500,
    "unread_count": 25,
    "type_distribution": {
      "reminder": 200,
      "lead_update": 150,
      "deal_update": 100,
      "system": 50
    },
    "priority_distribution": {
      "high": 50,
      "medium": 200,
      "low": 250
    },
    "sent_today": 15,
    "average_open_rate": 85.5
  }
}
```

---

## 🤖 الذكاء الاصطناعي

### تقييم العميل المحتمل

#### Request
```http
GET /api/ai/scoring?lead_id=lead-uuid
Authorization: Bearer <access_token>
```

#### Response
```json
{
  "statusCode": 200,
  "data": {
    "lead_id": "lead-uuid",
    "overall_score": 85,
    "scores": {
      "engagement": 90,
      "budget": 80,
      "timeline": 85,
      "source": 88,
      "property_interest": 82
    },
    "recommendations": [
      "اتصل بالعميل خلال 24 ساعة",
      "اعرض شقق في حي العليا",
      "اقترح جولة في عطلة نهاية الأسبوع"
    ],
    "risk_factors": [
      "المنافسة عالية في المنطقة",
      "العميل يحتاج وقت للقرار"
    ]
  }
}
```

### توقع الصفقات

#### Request
```http
GET /api/ai/forecast?period=6months
Authorization: Bearer <access_token>
```

#### Response
```json
{
  "statusCode": 200,
  "data": {
    "period": "6months",
    "forecast": {
      "total_revenue": 15000000,
      "total_deals": 25,
      "average_deal_size": 600000,
      "monthly_breakdown": [
        {
          "month": "2024-12",
          "revenue": 2000000,
          "deals": 4
        }
      ]
    },
    "confidence_level": 78,
    "factors": [
      "زيادة في استفسارات الموقع",
      "ارتفاع أسعار العقارات",
      "تحسن في أداء المبيعات"
    ]
  }
}
```

### الاقتراحات الذكية

#### Request
```http
GET /api/ai/recommendations?type=leads
Authorization: Bearer <access_token>
```

#### Response
```json
{
  "statusCode": 200,
  "data": {
    "type": "leads",
    "recommendations": [
      {
        "id": "rec-1",
        "title": "متابعة العملاء الجدد",
        "description": "اتصل بـ 15 عميل جديد خلال 24 ساعة",
        "priority": "high",
        "impact": "زيادة معدل التحويل بنسبة 25%",
        "leads": ["lead-1", "lead-2"]
      },
      {
        "id": "rec-2",
        "title": "حملة إعلانية",
        "description": "زيادة الميزانية الإعلانية على Facebook",
        "priority": "medium",
        "impact": "زيادة الاستفسارات بنسبة 40%"
      }
    ]
  }
}
```

---

## 💳 نظام الدفع

### خطط الاشتراكات

#### Request
```http
GET /api/payments/plans
Authorization: Bearer <access_token>
```

#### Response
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "plan-free",
      "name": "Free",
      "description": "للشركات الصغيرة",
      "price": 0,
      "currency": "SAR",
      "features": [
        "حتى 1 مستخدم",
        "إدارة العملاء المحتملين",
        "إدارة العقارات الأساسية",
        "التقارير الأساسية"
      ]
    },
    {
      "id": "plan-basic",
      "name": "Basic",
      "description": "للشركات المتوسطة",
      "price": 99,
      "currency": "SAR",
      "interval": "month",
      "features": [
        "حتى 5 مستخدمين",
        "جميع مميزات Free",
        "إدارة الصفقات",
        "WhatsApp Business API",
        "الدعم الفني"
      ]
    }
  ]
}
```

### إنشاء اشتراك

#### Request
```http
POST /api/payments/subscriptions
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "plan_id": "plan-basic",
  "payment_method": "card",
  "billing_address": {
    "line1": "شارع الملك فهد",
    "city": "الرياض",
    "country": "SA",
    "postal_code": "12345"
  }
}
```

#### Response
```json
{
  "statusCode": 200,
  "data": {
    "subscription_id": "sub_xxx",
    "client_secret": "pi_xxx_secret_xxx",
    "status": "incomplete"
  },
  "message": "تم إنشاء الاشتراك، أكمل الدفع"
}
```

### إدارة الاشتراكات

#### Request
```http
GET /api/payments/subscriptions
Authorization: Bearer <access_token>
```

#### Response
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "sub_xxx",
      "plan_name": "Basic",
      "status": "active",
      "current_period_start": "2024-12-01T00:00:00Z",
      "current_period_end": "2025-01-01T00:00:00Z",
      "cancel_at_period_end": false,
      "billing_history": [
        {
          "id": "inv_xxx",
          "amount": 99,
          "currency": "SAR",
          "status": "paid",
          "date": "2024-12-01T00:00:00Z"
        }
      ]
    }
  ]
}
```

### فواتير الدفع

#### Request
```http
GET /api/payments/billing
Authorization: Bearer <access_token>
```

#### Response
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "inv_xxx",
      "subscription_id": "sub_xxx",
      "amount": 99,
      "currency": "SAR",
      "status": "paid",
      "date": "2024-12-01T00:00:00Z",
      "download_url": "https://pay.stripe.com/invoice/inv_xxx/pdf"
    }
  ]
}
```

---

## 📊 التحليلات والتقارير

### لوحة التحكم

#### Request
```http
GET /api/analytics/dashboard
Authorization: Bearer <access_token>
```

#### Response
```json
{
  "statusCode": 200,
  "data": {
    "summary": {
      "total_leads": 150,
      "total_properties": 25,
      "total_deals": 12,
      "total_revenue": 7500000,
      "conversion_rate": 8.0,
      "average_deal_size": 625000
    },
    "charts": {
      "leads_by_month": [
        { "month": "2024-01", "count": 20 },
        { "month": "2024-02", "count": 25 }
      ],
      "revenue_by_month": [
        { "month": "2024-01", "amount": 1000000 },
        { "month": "2024-02", "amount": 1250000 }
      ],
      "pipeline_stages": [
        { "stage": "new", "count": 45 },
        { "stage": "qualified", "count": 30 }
      ]
    },
    "top_performers": [
      {
        "user": "أحمد محمد",
        "deals_closed": 5,
        "revenue": 2500000
      }
    ]
  }
}
```

### تقارير مفصلة

#### Request
```http
GET /api/analytics/sales?period=month&start_date=2024-01-01
Authorization: Bearer <access_token>
```

#### Response
```json
{
  "statusCode": 200,
  "data": {
    "period": "month",
    "summary": {
      "total_deals": 8,
      "total_revenue": 4500000,
      "average_deal_size": 562500,
      "conversion_rate": 12.5
    },
    "deals": [
      {
        "id": "deal-uuid",
        "title": "بيع شقة في حي العليا",
        "amount": 650000,
        "close_date": "2024-12-15",
        "agent": "أحمد محمد",
        "commission": 16250
      }
    ],
    "by_agent": [
      {
        "agent": "أحمد محمد",
        "deals_count": 3,
        "total_revenue": 1800000,
        "total_commission": 45000
      }
    ]
  }
}
```

### تصدير البيانات

#### Request
```http
GET /api/analytics/export?type=leads&format=csv&period=month
Authorization: Bearer <access_token>
```

#### Response
```json
{
  "statusCode": 200,
  "data": {
    "download_url": "https://cdn.example.com/exports/leads_2024_12.csv",
    "expires_at": "2024-12-01T01:00:00Z"
  },
  "message": "تم إعداد ملف التصدير، سيتم تحميله قريباً"
}
```

---

## ⚠️ الأخطاء والاستثناءات

### رموز حالة HTTP

| رمز | الوصف | مثال |
|------|--------|--------|
| 200 | نجح الطلب | GET /api/leads |
| 201 | تم إنشاء المورد | POST /api/leads |
| 400 | طلب غير صحيح | بيانات مفقودة |
| 401 | غير مصرح | Token منتهي الصلاحية |
| 403 | محظور | صلاحيات غير كافية |
| 404 | غير موجود | المورد غير موجود |
| 409 | تعارض | البريد الإلكتروني مستخدم |
| 422 | بيانات غير صحيحة | Validation error |
| 429 | طلبات كثيرة | Rate limit exceeded |
| 500 | خطأ في الخادم | Internal server error |

### أمثلة على الأخطاء

#### خطأ في المصادقة
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Invalid token"
}
```

#### خطأ في التحقق من البيانات
```json
{
  "statusCode": 422,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "البريد الإلكتروني مطلوب"
    },
    {
      "field": "password",
      "message": "كلمة المرور يجب أن تكون 8 أحرف على الأقل"
    }
  ]
}
```

#### خطأ في الصلاحيات
```json
{
  "statusCode": 403,
  "message": "Forbidden",
  "error": "Insufficient permissions"
}
```

#### خطأ في المورد غير موجود
```json
{
  "statusCode": 404,
  "message": "Lead not found",
  "error": "The requested lead does not exist"
}
```

### معالجة الأخطاء في الفرونت اند

```typescript
// مثال على معالجة الأخطاء
try {
  const response = await api.getLeads();
  setLeads(response.data);
} catch (error: any) {
  if (error.response?.status === 401) {
    // إعادة توجيه لتسجيل الدخول
    window.location.href = '/login';
  } else if (error.response?.status === 422) {
    // عرض أخطاء التحقق
    setErrors(error.response.data.errors);
  } else {
    // خطأ عام
    toast({
      title: "خطأ",
      description: error.response?.data?.message || "حدث خطأ غير متوقع",
      variant: "destructive"
    });
  }
}
```

### Rate Limiting

```json
{
  "statusCode": 429,
  "message": "Too Many Requests",
  "error": "Rate limit exceeded",
  "retry_after": 60
}
```

### معالجة Rate Limiting

```typescript
// إعادة المحاولة مع تأخير
const retryRequest = async (fn: Function, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.response?.status === 429) {
        const retryAfter = error.response.data.retry_after || 60;
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
};
```

---

## 📚 المزيد من الموارد

- [Swagger Documentation](http://localhost:3000/api/docs) - توثيق تفاعلي
- [README.md](../README.md) - نظرة عامة على المشروع
- [DEVELOPER_GUIDE.md](../DEVELOPER_GUIDE.md) - دليل المطورين
- [USER_GUIDE.md](../USER_GUIDE.md) - دليل المستخدمين

---

**🎉 EchoOps CRM API - مصمم ليكون قوي ومرن وسهل الاستخدام**

**📞 للدعم الفني:** support@echoops.com

**🚀 استمتع بالتطوير مع EchoOps CRM!**

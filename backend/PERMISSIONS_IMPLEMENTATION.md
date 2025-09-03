# تطبيق نظام الصلاحيات - EchoOps CRM

## 📊 **ملخص التطبيق**

### ✅ **ما تم إنجازه**
- [x] إنشاء `PermissionsGuard` متقدم مع دعم الصلاحيات المخصصة
- [x] إنشاء `PermissionsService` لإدارة الصلاحيات
- [x] إنشاء `permissions.decorator` لتطبيق الصلاحيات
- [x] تطبيق الصلاحيات على جميع Controllers الرئيسية:
  - [x] Developers Controller
  - [x] Projects Controller
  - [x] Properties Controller
  - [x] Leads Controller
  - [x] Deals Controller
  - [x] Activities Controller
  - [x] Users Controller
- [x] تعريف أنماط الصلاحيات القياسية

### 🔄 **قيد التنفيذ**
- [ ] تطبيق الصلاحيات على باقي Controllers
- [ ] تطبيق Row-Level Security في Services

### ⏳ **المتبقي**
- [ ] إنشاء/تحديث Seeders للأدوار والصلاحيات
- [ ] تطبيق الصلاحيات على Frontend

---

## 🏗️ **الهيكل التقني**

### **1. PermissionsGuard**
**الملف**: `backend/src/auth/guards/permissions.guard.ts`

**الميزات**:
- التحقق من الصلاحيات المطلوبة
- دعم الصلاحيات المخصصة لكل مستخدم
- دعم الصلاحيات العامة حسب الدور
- دعم الصلاحيات البديلة (Wildcard) مثل `users.*`

**المنطق**:
1. **Super Admin**: لديه جميع الصلاحيات
2. **Custom Permissions**: صلاحيات مخصصة محفوظة في `user.permissions`
3. **Role Permissions**: صلاحيات افتراضية حسب الدور

### **2. PermissionsService**
**الملف**: `backend/src/auth/services/permissions.service.ts`

**الميزات**:
- جلب صلاحيات المستخدم
- التحقق من وجود صلاحية محددة
- التحقق من وجود أي صلاحية من مجموعة
- التحقق من وجود جميع الصلاحيات
- تحديث صلاحيات المستخدم

### **3. Permissions Decorator**
**الملف**: `backend/src/auth/decorators/permissions.decorator.ts`

**الاستخدام**:
```typescript
@Post()
@Permissions('developers.create')
async create(@Body() createDeveloperDto: CreateDeveloperDto) {
  // ...
}
```

---

## 🔐 **أنماط الصلاحيات**

### **النمط القياسي**
```
resource.action
```

**أمثلة**:
- `users.read` - قراءة المستخدمين
- `developers.create` - إنشاء مطورين
- `properties.update` - تحديث الخصائص
- `projects.delete` - حذف المشاريع

### **الصلاحيات البديلة (Wildcard)**
```
resource.*
```

**أمثلة**:
- `users.*` - جميع صلاحيات المستخدمين
- `developers.*` - جميع صلاحيات المطورين
- `properties.*` - جميع صلاحيات الخصائص

---

## 👥 **صلاحيات الأدوار**

### **Super Admin**
- جميع الصلاحيات (`*.*`)

### **Company Admin**
- إدارة المستخدمين (CRUD)
- جميع صلاحيات الأعمال الأساسية
- إدارة المطورين والمشاريع
- الوصول للتقارير والتحليلات

### **Sales Manager**
- إدارة العملاء المحتملين والصفقات
- إدارة الخصائص والأنشطة
- قراءة معلومات المطورين والمشاريع
- الوصول للتقارير

### **Sales Agent**
- قراءة وإنشاء وتحديث العملاء المحتملين
- قراءة وإنشاء وتحديث الخصائص
- قراءة وإنشاء وتحديث الصفقات
- قراءة معلومات المطورين والمشاريع

### **Marketing**
- إدارة العملاء المحتملين
- قراءة الخصائص
- الوصول للتقارير والتحليلات

### **Support**
- قراءة وتحديث العملاء المحتملين
- قراءة وإنشاء الأنشطة

---

## 📝 **تطبيق الصلاحيات**

### **1. Developers Controller**
```typescript
@Controller('developers')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DevelopersController {
  @Post()
  @Permissions('developers.create')
  async create() { /* ... */ }

  @Get()
  @Permissions('developers.read')
  async findAll() { /* ... */ }

  @Patch(':id')
  @Permissions('developers.update')
  async update() { /* ... */ }

  @Delete(':id')
  @Permissions('developers.delete')
  async remove() { /* ... */ }
}
```

### **2. Projects Controller**
```typescript
@Controller('projects')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProjectsController {
  @Post()
  @Permissions('projects.create')
  async create() { /* ... */ }

  @Get()
  @Permissions('projects.read')
  async findAll() { /* ... */ }

  @Patch(':id')
  @Permissions('projects.update')
  async update() { /* ... */ }

  @Delete(':id')
  @Permissions('projects.delete')
  async remove() { /* ... */ }
}
```

### **3. Properties Controller**
```typescript
@Controller('properties')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PropertiesController {
  @Post()
  @Permissions('properties.create')
  async create() { /* ... */ }

  @Get()
  @Permissions('properties.read')
  async findAll() { /* ... */ }

  @Patch(':id')
  @Permissions('properties.update')
  async update() { /* ... */ }

  @Delete(':id')
  @Permissions('properties.delete')
  async remove() { /* ... */ }
}
```

### **4. Leads Controller**
```typescript
@Controller('leads')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class LeadsController {
  @Post()
  @Permissions('leads.create')
  async create() { /* ... */ }

  @Get()
  @Permissions('leads.read')
  async findAll() { /* ... */ }

  @Patch(':id')
  @Permissions('leads.update')
  async update() { /* ... */ }

  @Delete(':id')
  @Permissions('leads.delete')
  async remove() { /* ... */ }
}
```

### **5. Deals Controller**
```typescript
@Controller('deals')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DealsController {
  @Post()
  @Permissions('deals.create')
  async create() { /* ... */ }

  @Get()
  @Permissions('deals.read')
  async findAll() { /* ... */ }

  @Patch(':id')
  @Permissions('deals.update')
  async update() { /* ... */ }

  @Delete(':id')
  @Permissions('deals.delete')
  async remove() { /* ... */ }
}
```

### **6. Activities Controller**
```typescript
@Controller('activities')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ActivitiesController {
  @Post()
  @Permissions('activities.create')
  async create() { /* ... */ }

  @Get()
  @Permissions('activities.read')
  async findAll() { /* ... */ }

  @Patch(':id')
  @Permissions('activities.update')
  async update() { /* ... */ }

  @Delete(':id')
  @Permissions('activities.delete')
  async remove() { /* ... */ }
}
```

### **7. Users Controller**
```typescript
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  @Post()
  @Permissions('users.create')
  async create() { /* ... */ }

  @Get()
  @Permissions('users.read')
  async findAll() { /* ... */ }

  @Patch(':id')
  @Permissions('users.update')
  async update() { /* ... */ }

  @Delete(':id')
  @Permissions('users.delete')
  async remove() { /* ... */ }
}
```

---

## 🚀 **الخطوات التالية**

### **الأسبوع القادم**
1. **تطبيق Row-Level Security**:
   - تحديث Services للتحقق من الصلاحيات
   - إضافة فلاتر حسب الدور والصلاحيات
   - تطبيق الصلاحيات على مستوى البيانات

2. **إنشاء Seeders للأدوار والصلاحيات**:
   - إنشاء بيانات أولية للأدوار
   - إنشاء بيانات أولية للصلاحيات
   - ربط الأدوار بالصلاحيات

### **الأسبوع الذي يليه**
1. **إنشاء Seeders للأدوار والصلاحيات**
2. **تطبيق الصلاحيات على Frontend**
3. **اختبارات التكامل**

---

## 🧪 **اختبار الصلاحيات**

### **سيناريوهات الاختبار**
1. **مستخدم بدون صلاحيات**: يجب أن يحصل على خطأ 403
2. **مستخدم مع صلاحيات جزئية**: يجب أن يصل فقط للمسارات المسموحة
3. **مستخدم مع صلاحيات بديلة**: يجب أن يصل لجميع موارد النوع المحدد
4. **Super Admin**: يجب أن يصل لجميع المسارات

### **أمثلة الاختبار**
```typescript
// يجب أن يفشل
@Permissions('developers.create')
async createDeveloper() {
  // يجب أن يتحقق من الصلاحيات أولاً
}

// يجب أن ينجح للمستخدم مع developers.*
@Permissions('developers.read')
async getDevelopers() {
  // يجب أن يتحقق من الصلاحيات أولاً
}
```

---

## 📚 **المراجع**

### **الملفات المهمة**
- `backend/src/auth/guards/permissions.guard.ts` - الحارس الرئيسي
- `backend/src/auth/services/permissions.service.ts` - خدمة إدارة الصلاحيات
- `backend/src/auth/decorators/permissions.decorator.ts` - decorator الصلاحيات
- `backend/src/auth/interfaces/permissions.interface.ts` - تعريفات الصلاحيات

### **الملفات المحدثة**
- `backend/src/developers/developers.controller.ts`
- `backend/src/projects/projects.controller.ts`
- `backend/src/properties/properties.controller.ts`
- `backend/src/leads/leads.controller.ts`
- `backend/src/deals/deals.controller.ts`
- `backend/src/activities/activities.controller.ts`
- `backend/src/users/users.controller.ts`

---

*آخر تحديث: ${new Date().toLocaleDateString('ar-SA')}*

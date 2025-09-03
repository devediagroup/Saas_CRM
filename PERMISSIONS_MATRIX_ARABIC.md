# مصفوفة الصلاحيات المحدثة - EchoOps Real Estate CRM

## الملخص التنفيذي

تم تحديث نظام الصلاحيات ليتوافق مع التقرير المرفق، وفقاً لمصفوفة الصلاحيات التفصيلية المطلوبة لإدارة العقارات وشركات التسويق العقاري.

## 🏢 هيكل الأدوار (Role Structure)

### 1. Super Admin (المسؤول العام)
- **الوصف**: تحكم كامل في جميع جوانب النظام عبر جميع الشركات
- **النطاق**: عبر جميع الشركات (Cross-tenant)
- **الصلاحيات**: جميع الصلاحيات (`*.*`)

### 2. Company Admin (مسؤول الشركة)
- **الوصف**: مسؤول رئيسي عن إدارة النظام داخل شركته
- **النطاق**: شركته فقط (Single-tenant)
- **الصلاحيات**: إدارية كاملة على بيانات شركته

### 3. Sales Manager (مدير المبيعات)
- **الوصف**: إشراف على فريق وكلاء المبيعات
- **النطاق**: فريقه داخل الشركة
- **الصلاحيات**: مراقبة وإدارة عمليات المبيعات

### 4. Sales Agent (وكيل المبيعات)
- **الوصف**: التفاعل المباشر مع العملاء والصفقات
- **النطاق**: بياناته الشخصية والمعينة له
- **الصلاحيات**: إدارة عملائه وصفقاته وأنشطته

### 5. Marketing (التسويق)
- **الوصف**: إدارة الحملات التسويقية وجذب العملاء
- **النطاق**: الحملات والعملاء المحتملين التسويقيين
- **الصلاحيات**: إدارة الحملات وتحليل البيانات التسويقية

### 6. Support (الدعم)
- **الوصف**: تقديم الدعم الفني للمستخدمين
- **النطاق**: قراءة فقط لبيانات الشركة
- **الصلاحيات**: وصول للقراءة فقط لأغراض الدعم

## 📊 مصفوفة الصلاحيات المفصلة

### رموز الصلاحيات:
- **C**: إنشاء (Create)
- **R**: قراءة (Read)  
- **U**: تحديث (Update)
- **D**: حذف (Delete)
- **A**: تعيين (Assign)
- **App**: موافقة (Approve)

| الكيان / الميزة | Super Admin | Company Admin | Sales Manager | Sales Agent | Marketing | Support |
|:-----------------|:-----------:|:-------------:|:-------------:|:-----------:|:---------:|:-------:|
| **المستخدمون (Users)** | CRUD | CRUD (داخل شركته) | R (فريقه) | R (ملفه) | R (ملفه) | R (شركته) |
| **الشركات (Companies)** | CRUD | R, U (شركته) | - | - | - | - |
| **المطورون (Developers)** | CRUD | CRUD (شركته) | R | R | R | R |
| **المشاريع (Projects)** | CRUD | CRUD (شركته) | R | R | R | R |
| **الوحدات (Units)** | CRUD | CRUD (شركته) | R | R | R | R |
| **العملاء المحتملون (Leads)** | CRUD | R (شركته) | R, U, A (فريقه) | C, R, U (خاص به) | C, R, U (خاص به) | R (شركته) |
| **الصفقات (Deals)** | CRUD | R (شركته) | R, U, App (فريقه) | C, R, U (خاص به) | R | R (شركته) |
| **الأنشطة (Activities)** | CRUD | R (شركته) | R (فريقه), C,U,D (خاص به) | C, R, U, D (خاص به) | R | R (شركته) |
| **التقارير والتحليلات (Reports & Analytics)** | R (كامل) | R (شركته) | R (فريقه) | R (خاص به) | R | - |
| **الإعدادات (Settings)** | R, U (عام) | R, U (شركته) | - | - | R, U (تسويق) | - |
| **AI Analysis** | R, U | R, U (شركته) | R | R | R | - |
| **Marketing Campaigns** | R, U | R, U (شركته) | - | - | C, R, U, D | - |
| **Payments & Subscriptions** | R, U | R, U (شركته) | - | - | - | - |
| **Audit Logs** | R | R (شركته) | - | - | - | - |

## 🔧 الصلاحيات الخاصة المضافة

### 1. صلاحيات تعيين العملاء (Lead Assignment)
- **leads.assign**: تعيين العملاء المحتملين لوكلاء المبيعات
- **المتاحة لـ**: Super Admin, Company Admin, Sales Manager

### 2. صلاحيات الموافقة على الصفقات (Deal Approval)
- **deals.approve**: الموافقة على الصفقات قبل الإغلاق
- **المتاحة لـ**: Super Admin, Company Admin, Sales Manager

### 3. صلاحيات الحملات التسويقية (Marketing Campaigns)
- **campaigns.create**: إنشاء حملات تسويقية جديدة
- **campaigns.read**: عرض الحملات والإحصائيات
- **campaigns.update**: تعديل الحملات الموجودة
- **campaigns.delete**: حذف الحملات
- **المتاحة لـ**: Super Admin, Company Admin, Marketing

### 4. صلاحيات الذكاء الاصطناعي (AI Analysis)
- **ai.read**: عرض تحليلات الذكاء الاصطناعي
- **ai.update**: تحديث نماذج الذكاء الاصطناعي
- **المتاحة لـ**: Super Admin, Company Admin, Sales Manager, Sales Agent, Marketing

### 5. صلاحيات المدفوعات (Payments)
- **payments.read**: عرض بيانات المدفوعات والاشتراكات
- **payments.update**: تحديث حالة المدفوعات
- **المتاحة لـ**: Super Admin, Company Admin

### 6. صلاحيات سجلات التدقيق (Audit Logs)
- **audit.read**: عرض سجلات العمليات والتدقيق
- **المتاحة لـ**: Super Admin, Company Admin

## 🛡️ أمان مستوى الصفوف (Row-Level Security)

### Multi-tenant Isolation (عزل البيانات بين الشركات)
- جميع الاستعلامات تتضمن فلتر `companyId = user.companyId`
- Super Admin هو الوحيد الذي يمكنه تجاوز هذا القيد

### Role-based Data Filtering (تصفية البيانات حسب الدور)
- **Sales Agent**: يرى فقط البيانات المعينة له أو التي أنشأها
  - `WHERE assignedTo = userId OR createdBy = userId`
- **Sales Manager**: يرى بيانات فريقه
  - `WHERE managerId = userId OR userId IN (team_members)`
- **Marketing**: يرى العملاء المحتملين من الحملات التسويقية
  - `WHERE source = 'marketing' AND createdBy = userId`

## 🔄 التغييرات المطبقة

### ✅ تم إضافة الصلاحيات التالية:
1. **الإشعارات (Notifications)**:
   - `notifications.read`, `notifications.create`, `notifications.update`, `notifications.delete`

2. **المدفوعات (Payments)**:
   - `payments.read`, `payments.create`, `payments.update`, `payments.delete`

3. **الذكاء الاصطناعي (AI)**:
   - `ai.read`, `ai.create`, `ai.update`, `ai.delete`

4. **الحملات التسويقية (Campaigns)**:
   - `campaigns.read`, `campaigns.create`, `campaigns.update`, `campaigns.delete`

5. **الصلاحيات الخاصة (Special Permissions)**:
   - `leads.assign` - تعيين العملاء المحتملين
   - `deals.approve` - الموافقة على الصفقات
   - `audit.read` - عرض سجلات التدقيق

### ✅ تم تحديث أدوار المستخدمين:
- **Super Admin**: جميع الصلاحيات الجديدة
- **Company Admin**: صلاحيات إدارية شاملة داخل الشركة
- **Sales Manager**: صلاحيات التعيين والموافقة
- **Marketing**: صلاحيات الحملات التسويقية الكاملة
- **Support**: تحديث للوصول للقراءة فقط لجميع البيانات

## 📝 مثال على تطبيق الصلاحيات

### في الكود (Backend)
```typescript
// تعيين عميل محتمل لوكيل مبيعات
@Post('leads/:id/assign')
@Permissions('leads.assign')
async assignLead(@Param('id') leadId: string, @Body() assignData: AssignLeadDto) {
  return this.leadsService.assignToAgent(leadId, assignData);
}

// الموافقة على صفقة
@Post('deals/:id/approve') 
@Permissions('deals.approve')
async approveDeal(@Param('id') dealId: string) {
  return this.dealsService.approve(dealId);
}

// إنشاء حملة تسويقية
@Post('campaigns')
@Permissions('campaigns.create')
async createCampaign(@Body() campaignData: CreateCampaignDto) {
  return this.campaignsService.create(campaignData);
}
```

### في الواجهة الأمامية (Frontend)
```typescript
// إخفاء أزرار بناءً على الصلاحيات
{hasPermission('leads.assign') && (
  <Button onClick={handleAssignLead}>تعيين لوكيل</Button>
)}

{hasPermission('deals.approve') && (
  <Button onClick={handleApprove}>موافقة على الصفقة</Button>
)}

{hasPermission('campaigns.create') && (
  <Button onClick={handleCreateCampaign}>إنشاء حملة</Button>
)}
```

## 🚀 الخطوات التالية

1. **اختبار الصلاحيات الجديدة**:
   - اختبار وحدة للصلاحيات الخاصة
   - اختبار تكامل للـ Row-Level Security

2. **تحديث الواجهة الأمامية**:
   - تطبيق الصلاحيات الجديدة في المكونات
   - إضافة واجهات إدارة الحملات التسويقية

3. **توثيق شامل**:
   - دليل المطور للصلاحيات
   - دليل المستخدم للأدوار

---

**آخر تحديث**: ${new Date().toLocaleDateString('ar-SA')}
**الإصدار**: 2.0.0
**الحالة**: ✅ مُطبق
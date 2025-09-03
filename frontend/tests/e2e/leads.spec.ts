import { test, expect } from '@playwright/test';

test.describe('Leads Management E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // تسجيل الدخول أولاً
    await page.goto('http://localhost:3000');
    await page.fill('input[name="email"]', 'admin@echops.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // الانتقال لصفحة العملاء المحتملين
    await page.goto('http://localhost:3000/leads');
  });

  test('should display leads page with correct elements', async ({ page }) => {
    // التحقق من عنوان الصفحة
    await expect(page.locator('h1')).toContainText('العملاء المحتملين');
    
    // التحقق من وجود زر إضافة عميل محتمل جديد
    await expect(page.locator('button:has-text("إضافة عميل محتمل جديد")')).toBeVisible();
    
    // التحقق من وجود جدول العملاء المحتملين
    await expect(page.locator('table')).toBeVisible();
    
    // التحقق من وجود أعمدة الجدول
    await expect(page.locator('th:has-text("الاسم")')).toBeVisible();
    await expect(page.locator('th:has-text("البريد الإلكتروني")')).toBeVisible();
    await expect(page.locator('th:has-text("الهاتف")')).toBeVisible();
    await expect(page.locator('th:has-text("المصدر")')).toBeVisible();
    await expect(page.locator('th:has-text("الحالة")')).toBeVisible();
    await expect(page.locator('th:has-text("الإجراءات")')).toBeVisible();
  });

  test('should open create lead dialog when clicking add button', async ({ page }) => {
    // النقر على زر إضافة عميل محتمل جديد
    await page.click('button:has-text("إضافة عميل محتمل جديد")');
    
    // التحقق من ظهور نافذة الحوار
    await expect(page.locator('h2:has-text("إضافة عميل محتمل جديد")')).toBeVisible();
    
    // التحقق من وجود حقول النموذج
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="phone"]')).toBeVisible();
    await expect(page.locator('select[name="source"]')).toBeVisible();
    await expect(page.locator('select[name="status"]')).toBeVisible();
    await expect(page.locator('select[name="interest"]')).toBeVisible();
    await expect(page.locator('input[name="budget"]')).toBeVisible();
    await expect(page.locator('textarea[name="notes"]')).toBeVisible();
  });

  test('should create new lead successfully', async ({ page }) => {
    // فتح نافذة إضافة عميل محتمل جديد
    await page.click('button:has-text("إضافة عميل محتمل جديد")');
    
    // ملء النموذج
    await page.fill('input[name="name"]', 'أحمد محمد');
    await page.fill('input[name="email"]', 'ahmed@example.com');
    await page.fill('input[name="phone"]', '+966501234567');
    await page.selectOption('select[name="source"]', 'website');
    await page.selectOption('select[name="status"]', 'new');
    await page.selectOption('select[name="interest"]', 'شقة');
    await page.fill('input[name="budget"]', '500000');
    await page.fill('textarea[name="notes"]', 'عميل مهتم بشقة في الرياض');
    
    // النقر على زر الحفظ
    await page.click('button:has-text("حفظ")');
    
    // التحقق من إغلاق النافذة
    await expect(page.locator('h2:has-text("إضافة عميل محتمل جديد")')).not.toBeVisible();
    
    // التحقق من ظهور رسالة النجاح
    await expect(page.locator('text=تم إضافة العميل المحتمل بنجاح')).toBeVisible();
    
    // التحقق من ظهور العميل المحتمل الجديد في الجدول
    await expect(page.locator('text=أحمد محمد')).toBeVisible();
  });

  test('should show validation errors for required fields', async ({ page }) => {
    // فتح نافذة إضافة عميل محتمل جديد
    await page.click('button:has-text("إضافة عميل محتمل جديد")');
    
    // محاولة الحفظ بدون ملء الحقول المطلوبة
    await page.click('button:has-text("حفظ")');
    
    // التحقق من ظهور رسائل الخطأ
    await expect(page.locator('text=الاسم مطلوب')).toBeVisible();
    await expect(page.locator('text=البريد الإلكتروني مطلوب')).toBeVisible();
    await expect(page.locator('text=الهاتف مطلوب')).toBeVisible();
  });

  test('should edit existing lead successfully', async ({ page }) => {
    // البحث عن عميل محتمل موجود
    const leadRow = page.locator('tr:has-text("أحمد محمد")').first();
    
    // النقر على زر التعديل
    await leadRow.locator('button[aria-label="تعديل"]').click();
    
    // التحقق من فتح نافذة التعديل
    await expect(page.locator('h2:has-text("تعديل العميل المحتمل")')).toBeVisible();
    
    // تعديل البيانات
    await page.fill('input[name="name"]', 'أحمد محمد المحدث');
    await page.fill('textarea[name="notes"]', 'ملاحظات محدثة');
    
    // النقر على زر الحفظ
    await page.click('button:has-text("حفظ")');
    
    // التحقق من إغلاق النافذة
    await expect(page.locator('h2:has-text("تعديل العميل المحتمل")')).not.toBeVisible();
    
    // التحقق من ظهور رسالة النجاح
    await expect(page.locator('text=تم تحديث العميل المحتمل بنجاح')).toBeVisible();
    
    // التحقق من تحديث البيانات في الجدول
    await expect(page.locator('text=أحمد محمد المحدث')).toBeVisible();
  });

  test('should delete lead successfully', async ({ page }) => {
    // البحث عن عميل محتمل موجود
    const leadRow = page.locator('tr:has-text("أحمد محمد المحدث")').first();
    
    // النقر على زر الحذف
    await leadRow.locator('button[aria-label="حذف"]').click();
    
    // التحقق من ظهور نافذة تأكيد الحذف
    await expect(page.locator('text=تأكيد الحذف')).toBeVisible();
    await expect(page.locator('text=هل أنت متأكد من حذف هذا العميل المحتمل؟')).toBeVisible();
    
    // النقر على زر تأكيد الحذف
    await page.click('button:has-text("حذف")');
    
    // التحقق من إغلاق نافذة التأكيد
    await expect(page.locator('text=تأكيد الحذف')).not.toBeVisible();
    
    // التحقق من ظهور رسالة النجاح
    await expect(page.locator('text=تم حذف العميل المحتمل بنجاح')).toBeVisible();
    
    // التحقق من اختفاء العميل المحتمل من الجدول
    await expect(page.locator('text=أحمد محمد المحدث')).not.toBeVisible();
  });

  test('should filter leads by status', async ({ page }) => {
    // اختيار فلتر الحالة
    await page.selectOption('select[name="statusFilter"]', 'new');
    
    // التحقق من تحديث الجدول
    await expect(page.locator('tr')).toHaveCount(2); // header + filtered rows
    
    // التحقق من أن جميع الصفوف لها الحالة المحددة
    const rows = page.locator('tr').nth(1); // أول صف بيانات
    await expect(rows.locator('td:nth-child(5)')).toContainText('جديد');
  });

  test('should filter leads by source', async ({ page }) => {
    // اختيار فلتر المصدر
    await page.selectOption('select[name="sourceFilter"]', 'website');
    
    // التحقق من تحديث الجدول
    await expect(page.locator('tr')).toHaveCount(2); // header + filtered rows
    
    // التحقق من أن جميع الصفوف لها المصدر المحدد
    const rows = page.locator('tr').nth(1); // أول صف بيانات
    await expect(rows.locator('td:nth-child(4)')).toContainText('الموقع الإلكتروني');
  });

  test('should search leads by name', async ({ page }) => {
    // البحث باسم
    await page.fill('input[name="search"]', 'أحمد');
    
    // النقر على زر البحث
    await page.click('button[aria-label="بحث"]');
    
    // التحقق من تحديث الجدول
    await expect(page.locator('tr')).toHaveCount(2); // header + filtered rows
    
    // التحقق من أن جميع الصفوف تحتوي على الاسم المبحوث عنه
    const rows = page.locator('tr').nth(1); // أول صف بيانات
    await expect(rows.locator('td:nth-child(1)')).toContainText('أحمد');
  });

  test('should export leads to CSV', async ({ page }) => {
    // النقر على زر التصدير
    await page.click('button:has-text("تصدير CSV")');
    
    // التحقق من بدء التحميل
    await expect(page.locator('text=جاري التصدير...')).toBeVisible();
    
    // انتظار اكتمال التصدير
    await page.waitForSelector('text=تم التصدير بنجاح');
    
    // التحقق من رسالة النجاح
    await expect(page.locator('text=تم التصدير بنجاح')).toBeVisible();
  });

  test('should handle bulk actions', async ({ page }) => {
    // تحديد صفوف متعددة
    const checkboxes = page.locator('input[type="checkbox"]');
    await checkboxes.nth(1).check(); // تحديد أول صف
    await checkboxes.nth(2).check(); // تحديد ثاني صف
    
    // التحقق من ظهور شريط الإجراءات الجماعية
    await expect(page.locator('text=إجراءات جماعية')).toBeVisible();
    
    // اختيار إجراء جماعي
    await page.selectOption('select[name="bulkAction"]', 'update_status');
    await page.selectOption('select[name="bulkStatus"]', 'contacted');
    
    // النقر على زر تطبيق الإجراء
    await page.click('button:has-text("تطبيق")');
    
    // التحقق من ظهور رسالة النجاح
    await expect(page.locator('text=تم تحديث الحالة بنجاح')).toBeVisible();
  });

  test('should show lead details in modal', async ({ page }) => {
    // البحث عن عميل محتمل
    const leadRow = page.locator('tr:has-text("أحمد محمد")').first();
    
    // النقر على اسم العميل المحتمل لفتح التفاصيل
    await leadRow.locator('td:nth-child(1)').click();
    
    // التحقق من فتح نافذة التفاصيل
    await expect(page.locator('h2:has-text("تفاصيل العميل المحتمل")')).toBeVisible();
    
    // التحقق من عرض جميع التفاصيل
    await expect(page.locator('text=أحمد محمد')).toBeVisible();
    await expect(page.locator('text=ahmed@example.com')).toBeVisible();
    await expect(page.locator('text=+966501234567')).toBeVisible();
    await expect(page.locator('text=الموقع الإلكتروني')).toBeVisible();
    await expect(page.locator('text=جديد')).toBeVisible();
    await expect(page.locator('text=شقة')).toBeVisible();
    await expect(page.locator('text=500000')).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // محاكاة خطأ في الشبكة
    await page.route('**/api/leads', route => {
      route.abort('failed');
    });
    
    // محاولة تحميل العملاء المحتملين
    await page.reload();
    
    // التحقق من ظهور رسالة خطأ
    await expect(page.locator('text=حدث خطأ في تحميل البيانات')).toBeVisible();
    
    // التحقق من وجود زر إعادة المحاولة
    await expect(page.locator('button:has-text("إعادة المحاولة")')).toBeVisible();
  });

  test('should show loading states during operations', async ({ page }) => {
    // فتح نافذة إضافة عميل محتمل جديد
    await page.click('button:has-text("إضافة عميل محتمل جديد")');
    
    // ملء النموذج
    await page.fill('input[name="name"]', 'محمد علي');
    await page.fill('input[name="email"]', 'mohamed@example.com');
    await page.fill('input[name="phone"]', '+966501234568');
    
    // النقر على زر الحفظ
    await page.click('button:has-text("حفظ")');
    
    // التحقق من ظهور حالة التحميل
    await expect(page.locator('button:has-text("حفظ")')).toBeDisabled();
    await expect(page.locator('text=جاري الحفظ...')).toBeVisible();
  });
});

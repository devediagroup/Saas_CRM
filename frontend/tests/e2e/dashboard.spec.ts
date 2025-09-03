import { test, expect } from '@playwright/test';

test.describe('Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // تسجيل الدخول أولاً
    await page.goto('http://localhost:3000');
    await page.fill('input[name="email"]', 'admin@echops.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // الانتقال للوحة التحكم
    await page.goto('http://localhost:3000/dashboard');
  });

  test('should display dashboard with correct elements', async ({ page }) => {
    // التحقق من عنوان الصفحة
    await expect(page.locator('h1')).toContainText('لوحة التحكم');
    
    // التحقق من وجود بطاقات الإحصائيات
    await expect(page.locator('text=إجمالي العملاء المحتملين')).toBeVisible();
    await expect(page.locator('text=إجمالي الصفقات')).toBeVisible();
    await expect(page.locator('text=إجمالي المبيعات')).toBeVisible();
    await expect(page.locator('text=إجمالي المشاريع')).toBeVisible();
    
    // التحقق من وجود الرسوم البيانية
    await expect(page.locator('canvas')).toBeVisible();
    
    // التحقق من وجود جدول آخر النشاطات
    await expect(page.locator('h2:has-text("آخر النشاطات")')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
  });

  test('should display correct statistics', async ({ page }) => {
    // التحقق من أن الإحصائيات أرقام صحيحة
    const totalLeads = page.locator('text=إجمالي العملاء المحتملين').locator('..').locator('.text-3xl');
    await expect(totalLeads).toContainText(/\d+/);
    
    const totalDeals = page.locator('text=إجمالي الصفقات').locator('..').locator('.text-3xl');
    await expect(totalDeals).toContainText(/\d+/);
    
    const totalSales = page.locator('text=إجمالي المبيعات').locator('..').locator('.text-3xl');
    await expect(totalSales).toContainText(/\d+/);
    
    const totalProjects = page.locator('text=إجمالي المشاريع').locator('..').locator('.text-3xl');
    await expect(totalProjects).toContainText(/\d+/);
  });

  test('should navigate to leads page from dashboard', async ({ page }) => {
    // النقر على "عرض الكل" في بطاقة العملاء المحتملين
    await page.click('text=عرض الكل');
    
    // التحقق من الانتقال لصفحة العملاء المحتملين
    await expect(page).toHaveURL('http://localhost:3000/leads');
    await expect(page.locator('h1')).toContainText('العملاء المحتملين');
  });

  test('should navigate to deals page from dashboard', async ({ page }) => {
    // النقر على "عرض الكل" في بطاقة الصفقات
    await page.click('text=عرض الكل');
    
    // التحقق من الانتقال لصفحة الصفقات
    await expect(page).toHaveURL('http://localhost:3000/deals');
    await expect(page.locator('h1')).toContainText('الصفقات');
  });

  test('should navigate to projects page from dashboard', async ({ page }) => {
    // النقر على "عرض الكل" في بطاقة المشاريع
    await page.click('text=عرض الكل');
    
    // التحقق من الانتقال لصفحة المشاريع
    await expect(page).toHaveURL('http://localhost:3000/projects');
    await expect(page.locator('h1')).toContainText('المشاريع');
  });

  test('should display recent activities table', async ({ page }) => {
    // التحقق من وجود جدول النشاطات
    await expect(page.locator('table')).toBeVisible();
    
    // التحقق من وجود أعمدة الجدول
    await expect(page.locator('th:has-text("النشاط")')).toBeVisible();
    await expect(page.locator('th:has-text("المستخدم")')).toBeVisible();
    await expect(page.locator('th:has-text("التاريخ")')).toBeVisible();
    await expect(page.locator('th:has-text="الحالة")')).toBeVisible();
  });

  test('should show activity details on click', async ({ page }) => {
    // النقر على أول نشاط في الجدول
    const firstActivity = page.locator('tr').nth(1); // أول صف بيانات
    await firstActivity.click();
    
    // التحقق من فتح نافذة تفاصيل النشاط
    await expect(page.locator('h2:has-text("تفاصيل النشاط")')).toBeVisible();
    
    // التحقق من وجود تفاصيل النشاط
    await expect(page.locator('text=النشاط:')).toBeVisible();
    await expect(page.locator('text=المستخدم:')).toBeVisible();
    await expect(page.locator('text=التاريخ:')).toBeVisible();
    await expect(page.locator('text=الحالة:')).toBeVisible();
  });

  test('should refresh dashboard data', async ({ page }) => {
    // النقر على زر تحديث البيانات
    await page.click('button[aria-label="تحديث البيانات"]');
    
    // التحقق من ظهور حالة التحميل
    await expect(page.locator('text=جاري تحديث البيانات...')).toBeVisible();
    
    // انتظار اكتمال التحديث
    await page.waitForSelector('text=تم تحديث البيانات بنجاح');
    
    // التحقق من رسالة النجاح
    await expect(page.locator('text=تم تحديث البيانات بنجاح')).toBeVisible();
  });

  test('should filter activities by date range', async ({ page }) => {
    // اختيار نطاق تاريخي
    await page.click('input[name="dateRange"]');
    
    // اختيار تاريخ البداية
    await page.click('button[aria-label="اختيار تاريخ البداية"]');
    await page.click('td:has-text("1")'); // اليوم الأول من الشهر
    
    // اختيار تاريخ النهاية
    await page.click('button[aria-label="اختيار تاريخ النهاية"]');
    await page.click('td:has-text("15")'); // اليوم الخامس عشر من الشهر
    
    // النقر على زر تطبيق الفلتر
    await page.click('button:has-text("تطبيق")');
    
    // التحقق من تحديث الجدول
    await expect(page.locator('tr')).toHaveCount(2); // header + filtered rows
  });

  test('should export dashboard data', async ({ page }) => {
    // النقر على زر التصدير
    await page.click('button:has-text("تصدير التقرير")');
    
    // التحقق من ظهور نافذة اختيار نوع التصدير
    await expect(page.locator('h2:has-text("تصدير التقرير")')).toBeVisible();
    
    // اختيار نوع التصدير
    await page.selectOption('select[name="exportType"]', 'pdf');
    
    // النقر على زر التصدير
    await page.click('button:has-text("تصدير")');
    
    // التحقق من بدء التصدير
    await expect(page.locator('text=جاري التصدير...')).toBeVisible();
    
    // انتظار اكتمال التصدير
    await page.waitForSelector('text=تم التصدير بنجاح');
    
    // التحقق من رسالة النجاح
    await expect(page.locator('text=تم التصدير بنجاح')).toBeVisible();
  });

  test('should show notifications', async ({ page }) => {
    // النقر على زر الإشعارات
    await page.click('button[aria-label="الإشعارات"]');
    
    // التحقق من ظهور قائمة الإشعارات
    await expect(page.locator('div[role="menu"]')).toBeVisible();
    
    // التحقق من وجود إشعارات
    await expect(page.locator('text=لا توجد إشعارات جديدة')).toBeVisible();
  });

  test('should handle responsive design', async ({ page }) => {
    // تغيير حجم النافذة لشاشة صغيرة
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // التحقق من أن البطاقات تترتب في عمود واحد
    const statsCards = page.locator('.grid-cols-1');
    await expect(statsCards).toBeVisible();
    
    // التحقق من أن القائمة الجانبية تختفي
    await expect(page.locator('nav')).not.toBeVisible();
    
    // النقر على زر القائمة
    await page.click('button[aria-label="القائمة"]');
    
    // التحقق من ظهور القائمة الجانبية
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should show loading states', async ({ page }) => {
    // محاكاة بطء في الشبكة
    await page.route('**/api/dashboard/stats', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({}),
        delay: 2000
      });
    });
    
    // تحديث الصفحة
    await page.reload();
    
    // التحقق من ظهور حالة التحميل
    await expect(page.locator('text=جاري تحميل البيانات...')).toBeVisible();
    
    // انتظار اكتمال التحميل
    await page.waitForSelector('text=إجمالي العملاء المحتملين');
    
    // التحقق من اختفاء حالة التحميل
    await expect(page.locator('text=جاري تحميل البيانات...')).not.toBeVisible();
  });

  test('should handle errors gracefully', async ({ page }) => {
    // محاكاة خطأ في الشبكة
    await page.route('**/api/dashboard/stats', route => {
      route.abort('failed');
    });
    
    // تحديث الصفحة
    await page.reload();
    
    // التحقق من ظهور رسالة خطأ
    await expect(page.locator('text=حدث خطأ في تحميل البيانات')).toBeVisible();
    
    // التحقق من وجود زر إعادة المحاولة
    await expect(page.locator('button:has-text("إعادة المحاولة")')).toBeVisible();
    
    // النقر على زر إعادة المحاولة
    await page.click('button:has-text("إعادة المحاولة")');
    
    // التحقق من محاولة إعادة التحميل
    await expect(page.locator('text=جاري تحميل البيانات...')).toBeVisible();
  });

  test('should show user profile information', async ({ page }) => {
    // النقر على صورة المستخدم
    await page.click('img[alt="صورة المستخدم"]');
    
    // التحقق من ظهور قائمة الملف الشخصي
    await expect(page.locator('div[role="menu"]')).toBeVisible();
    
    // التحقق من وجود خيارات الملف الشخصي
    await expect(page.locator('text=الملف الشخصي')).toBeVisible();
    await expect(page.locator('text=الإعدادات')).toBeVisible();
    await expect(page.locator('text=تسجيل الخروج')).toBeVisible();
    
    // النقر على الملف الشخصي
    await page.click('text=الملف الشخصي');
    
    // التحقق من الانتقال لصفحة الملف الشخصي
    await expect(page).toHaveURL('http://localhost:3000/profile');
  });
});

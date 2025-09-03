import { chromium, FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // تسجيل الدخول كمدير النظام
  await page.goto('http://localhost:3000');
  await page.fill('input[name="email"]', 'admin@echops.com');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  
  await page.waitForURL('http://localhost:3000/dashboard');
  
  // حذف المستخدم التجريبي
  await page.goto('http://localhost:3000/users');
  
  // البحث عن المستخدم التجريبي
  await page.fill('input[name="search"]', 'مستخدم اختبار');
  await page.click('button[aria-label="بحث"]');
  
  // حذف المستخدم
  const userRow = page.locator('tr:has-text("مستخدم اختبار")').first();
  await userRow.locator('button[aria-label="حذف"]').click();
  
  // تأكيد الحذف
  await page.click('button:has-text("حذف")');
  await page.waitForSelector('text=تم حذف المستخدم بنجاح');
  
  // حذف البيانات التجريبية الأخرى
  await cleanupTestData(page);
  
  await browser.close();
}

async function cleanupTestData(page: any) {
  // حذف العملاء المحتملين التجريبيين
  await page.goto('http://localhost:3000/leads');
  await page.fill('input[name="search"]', 'أحمد محمد');
  await page.click('button[aria-label="بحث"]');
  
  const leadRows = page.locator('tr:has-text("أحمد محمد")');
  const count = await leadRows.count();
  
  for (let i = 0; i < count; i++) {
    await leadRows.first().locator('button[aria-label="حذف"]').click();
    await page.click('button:has-text("حذف")');
    await page.waitForSelector('text=تم حذف العميل المحتمل بنجاح');
  }
  
  // حذف الصفقات التجريبية
  await page.goto('http://localhost:3000/deals');
  await page.fill('input[name="search"]', 'صفقة شقة في الرياض');
  await page.click('button[aria-label="بحث"]');
  
  const dealRows = page.locator('tr:has-text("صفقة شقة في الرياض")');
  const dealCount = await dealRows.count();
  
  for (let i = 0; i < dealCount; i++) {
    await dealRows.first().locator('button[aria-label="حذف"]').click();
    await page.click('button:has-text("حذف")');
    await page.waitForSelector('text=تم حذف الصفقة بنجاح');
  }
  
  // حذف المطورين التجريبيين
  await page.goto('http://localhost:3000/developers');
  await page.fill('input[name="search"]', 'شركة الرياض للتطوير العقاري');
  await page.click('button[aria-label="بحث"]');
  
  const developerRows = page.locator('tr:has-text("شركة الرياض للتطوير العقاري")');
  const developerCount = await developerRows.count();
  
  for (let i = 0; i < developerCount; i++) {
    await developerRows.first().locator('button[aria-label="حذف"]').click();
    await page.click('button:has-text("حذف")');
    await page.waitForSelector('text=تم حذف المطور بنجاح');
  }
  
  // حذف المشاريع التجريبية
  await page.goto('http://localhost:3000/projects');
  await page.fill('input[name="search"]', 'مشروع الرياض السكني');
  await page.click('button[aria-label="بحث"]');
  
  const projectRows = page.locator('tr:has-text("مشروع الرياض السكني")');
  const projectCount = await projectRows.count();
  
  for (let i = 0; i < projectCount; i++) {
    await projectRows.first().locator('button[aria-label="حذف"]').click();
    await page.click('button:has-text("حذف")');
    await page.waitForSelector('text=تم حذف المشروع بنجاح');
  }
}

export default globalTeardown;

import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // تسجيل الدخول كمدير النظام
  await page.goto('http://localhost:3000');
  await page.fill('input[name="email"]', 'admin@echops.com');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  
  // انتظار تسجيل الدخول
  await page.waitForURL('http://localhost:3000/dashboard');
  
  // حفظ حالة تسجيل الدخول
  await page.context().storageState({ path: 'playwright/.auth/admin.json' });
  
  // إنشاء مستخدم عادي للاختبار
  await page.goto('http://localhost:3000/users');
  await page.click('button:has-text("إضافة مستخدم جديد")');
  
  await page.fill('input[name="name"]', 'مستخدم اختبار');
  await page.fill('input[name="email"]', 'test@echops.com');
  await page.fill('input[name="password"]', 'test123');
  await page.selectOption('select[name="role"]', 'AGENT');
  
  await page.click('button:has-text("حفظ")');
  await page.waitForSelector('text=تم إضافة المستخدم بنجاح');
  
  // تسجيل الدخول كمستخدم عادي
  await page.goto('http://localhost:3000/logout');
  await page.goto('http://localhost:3000');
  await page.fill('input[name="email"]', 'test@echops.com');
  await page.fill('input[name="password"]', 'test123');
  await page.click('button[type="submit"]');
  
  await page.waitForURL('http://localhost:3000/dashboard');
  
  // حفظ حالة تسجيل الدخول للمستخدم العادي
  await page.context().storageState({ path: 'playwright/.auth/user.json' });
  
  await browser.close();
}

export default globalSetup;

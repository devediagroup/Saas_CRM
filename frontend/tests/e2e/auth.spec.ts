import { test, expect } from '@playwright/test';

test.describe('Authentication E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should display login page for unauthenticated users', async ({ page }) => {
    // التحقق من أن صفحة تسجيل الدخول معروضة
    await expect(page.locator('h1')).toContainText('تسجيل الدخول');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    // محاولة تسجيل الدخول بدون بيانات
    await page.click('button[type="submit"]');
    
    // التحقق من ظهور رسائل الخطأ
    await expect(page.locator('text=البريد الإلكتروني مطلوب')).toBeVisible();
    await expect(page.locator('text=كلمة المرور مطلوبة')).toBeVisible();
  });

  test('should show validation error for invalid email', async ({ page }) => {
    // إدخال بريد إلكتروني غير صحيح
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // التحقق من ظهور رسالة خطأ البريد الإلكتروني
    await expect(page.locator('text=البريد الإلكتروني غير صحيح')).toBeVisible();
  });

  test('should show validation error for short password', async ({ page }) => {
    // إدخال كلمة مرور قصيرة
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', '123');
    await page.click('button[type="submit"]');
    
    // التحقق من ظهور رسالة خطأ كلمة المرور
    await expect(page.locator('text=كلمة المرور يجب أن تكون 6 أحرف على الأقل')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // إدخال بيانات غير صحيحة
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // التحقق من ظهور رسالة خطأ البيانات غير صحيحة
    await expect(page.locator('text=البريد الإلكتروني أو كلمة المرور غير صحيحة')).toBeVisible();
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // إدخال بيانات صحيحة
    await page.fill('input[name="email"]', 'admin@echops.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // التحقق من الانتقال إلى لوحة التحكم
    await expect(page).toHaveURL('http://localhost:3000/dashboard');
    await expect(page.locator('h1')).toContainText('لوحة التحكم');
  });

  test('should redirect authenticated users to dashboard', async ({ page }) => {
    // تسجيل الدخول أولاً
    await page.fill('input[name="email"]', 'admin@echops.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // محاولة الوصول لصفحة تسجيل الدخول مرة أخرى
    await page.goto('http://localhost:3000/login');
    
    // التحقق من إعادة التوجيه للوحة التحكم
    await expect(page).toHaveURL('http://localhost:3000/dashboard');
  });

  test('should logout successfully', async ({ page }) => {
    // تسجيل الدخول أولاً
    await page.fill('input[name="email"]', 'admin@echops.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // التحقق من الوصول للوحة التحكم
    await expect(page).toHaveURL('http://localhost:3000/dashboard');
    
    // النقر على زر تسجيل الخروج
    await page.click('button[aria-label="تسجيل الخروج"]');
    
    // التحقق من العودة لصفحة تسجيل الدخول
    await expect(page).toHaveURL('http://localhost:3000/login');
    await expect(page.locator('h1')).toContainText('تسجيل الدخول');
  });

  test('should remember user session after page refresh', async ({ page }) => {
    // تسجيل الدخول
    await page.fill('input[name="email"]', 'admin@echops.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // التحقق من الوصول للوحة التحكم
    await expect(page).toHaveURL('http://localhost:3000/dashboard');
    
    // تحديث الصفحة
    await page.reload();
    
    // التحقق من البقاء في لوحة التحكم
    await expect(page).toHaveURL('http://localhost:3000/dashboard');
    await expect(page.locator('h1')).toContainText('لوحة التحكم');
  });

  test('should show loading state during login', async ({ page }) => {
    // إدخال بيانات صحيحة
    await page.fill('input[name="email"]', 'admin@echops.com');
    await page.fill('input[name="password"]', 'admin123');
    
    // النقر على زر تسجيل الدخول
    await page.click('button[type="submit"]');
    
    // التحقق من ظهور حالة التحميل
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
    await expect(page.locator('text=جاري تسجيل الدخول...')).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // محاكاة خطأ في الشبكة
    await page.route('**/api/auth/login', route => {
      route.abort('failed');
    });
    
    // محاولة تسجيل الدخول
    await page.fill('input[name="email"]', 'admin@echops.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // التحقق من ظهور رسالة خطأ الشبكة
    await expect(page.locator('text=حدث خطأ في الاتصال')).toBeVisible();
  });
});

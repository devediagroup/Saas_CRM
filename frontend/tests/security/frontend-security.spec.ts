import { test, expect } from '@playwright/test';

test.describe('Frontend Security Tests', () => {
  test.beforeEach(async ({ page }) => {
    // تسجيل الدخول أولاً
    await page.goto('http://localhost:3000');
    await page.fill('input[name="email"]', 'admin@echops.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/dashboard');
  });

  test('should prevent XSS attacks in user input fields', async ({ page }) => {
    const xssPayloads = [
      '<script>alert("xss")</script>',
      'javascript:alert("xss")',
      '<img src="x" onerror="alert(\'xss\')">',
      '"><script>alert("xss")</script>',
      '<svg onload="alert(\'xss\')">',
      'javascript:void(0)',
      'data:text/html,<script>alert("xss")</script>'
    ];

    for (const payload of xssPayloads) {
      // الانتقال لصفحة إضافة مستخدم جديد
      await page.goto('http://localhost:3000/users');
      await page.click('button:has-text("إضافة مستخدم جديد")');

      // إدخال payload خبيث
      await page.fill('input[name="name"]', payload);
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.selectOption('select[name="role"]', 'AGENT');

      // النقر على زر الحفظ
      await page.click('button:has-text("حفظ")');

      // التحقق من أن النص معروض كنص عادي وليس كـ HTML
      const nameInput = page.locator('input[name="name"]');
      const inputValue = await nameInput.inputValue();
      
      // يجب ألا يحتوي على علامات HTML
      expect(inputValue).not.toContain('<script>');
      expect(inputValue).not.toContain('javascript:');
      expect(inputValue).not.toContain('onerror=');
      expect(inputValue).not.toContain('onload=');
    }
  });

  test('should prevent XSS in displayed data', async ({ page }) => {
    // إنشاء عميل محتمل مع payload خبيث
    await page.goto('http://localhost:3000/leads');
    await page.click('button:has-text("إضافة عميل محتمل جديد")');

    const maliciousName = '<script>alert("xss")</script>Test User';
    await page.fill('input[name="name"]', maliciousName);
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '+966501234567');
    await page.click('button:has-text("حفظ")');

    // الانتقال للجدول
    await page.waitForSelector('text=تم إضافة العميل المحتمل بنجاح');
    
    // البحث عن العميل المحتمل
    await page.fill('input[name="search"]', 'Test User');
    await page.click('button[aria-label="بحث"]');

    // التحقق من أن النص معروض كنص عادي
    const nameCell = page.locator('td:has-text("Test User")').first();
    const cellText = await nameCell.textContent();
    
    // يجب ألا يحتوي على علامات HTML
    expect(cellText).not.toContain('<script>');
    expect(cellText).not.toContain('javascript:');
  });

  test('should prevent CSRF attacks', async ({ page }) => {
    // محاكاة هجوم CSRF
    await page.goto('http://localhost:3000');
    
    // محاولة إرسال طلب من موقع خارجي
    const response = await page.evaluate(async () => {
      try {
        const result = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'CSRF User',
            email: 'csrf@test.com',
            password: 'password123',
            role: 'AGENT'
          })
        });
        return result.status;
      } catch (error) {
        return 'error';
      }
    });

    // يجب أن يعيد خطأ 401 أو 403
    expect([401, 403, 'error']).toContain(response);
  });

  test('should prevent clickjacking attacks', async ({ page }) => {
    // محاكاة محاولة clickjacking
    await page.goto('http://localhost:3000/dashboard');
    
    // التحقق من وجود headers مناسبة
    const response = await page.evaluate(async () => {
      try {
        const result = await fetch('/api/dashboard/stats');
        return result.headers.get('X-Frame-Options');
      } catch (error) {
        return 'error';
      }
    });

    // يجب أن يكون X-Frame-Options موجود
    expect(['DENY', 'SAMEORIGIN']).toContain(response);
  });

  test('should prevent information disclosure in error messages', async ({ page }) => {
    // محاولة الوصول لصفحة غير موجودة
    await page.goto('http://localhost:3000/nonexistent-page');
    
    // التحقق من أن رسالة الخطأ لا تكشف معلومات حساسة
    const errorMessage = await page.locator('text=404').textContent();
    
    // يجب ألا تحتوي على تفاصيل تقنية
    expect(errorMessage).not.toContain('stack trace');
    expect(errorMessage).not.toContain('database');
    expect(errorMessage).not.toContain('SQL');
    expect(errorMessage).not.toContain('internal');
  });

  test('should validate input length to prevent DoS attacks', async ({ page }) => {
    // إدخال نص طويل جداً
    const longText = 'a'.repeat(10000);
    
    await page.goto('http://localhost:3000/leads');
    await page.click('button:has-text("إضافة عميل محتمل جديد")');
    
    await page.fill('input[name="name"]', longText);
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '+966501234567');
    
    // النقر على زر الحفظ
    await page.click('button:has-text("حفظ")');
    
    // يجب أن يظهر خطأ التحقق من صحة البيانات
    await expect(page.locator('text=الاسم طويل جداً')).toBeVisible();
  });

  test('should prevent SQL injection in search fields', async ({ page }) => {
    const sqlInjectionPayloads = [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "' UNION SELECT * FROM users --",
      "'; INSERT INTO users VALUES ('hacker', 'pass'); --"
    ];

    for (const payload of sqlInjectionPayloads) {
      await page.goto('http://localhost:3000/leads');
      
      // إدخال payload في حقل البحث
      await page.fill('input[name="search"]', payload);
      await page.click('button[aria-label="بحث"]');
      
      // يجب ألا يحدث خطأ في الخادم
      await expect(page.locator('text=حدث خطأ في الخادم')).not.toBeVisible();
      
      // يجب أن يعيد نتائج فارغة أو رسالة خطأ مناسبة
      const results = page.locator('tr');
      const count = await results.count();
      
      // يجب أن يكون هناك على الأقل صف العنوان
      expect(count).toBeGreaterThanOrEqual(1);
    }
  });

  test('should prevent directory traversal attacks', async ({ page }) => {
    const traversalPayloads = [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
      '....//....//....//etc/passwd',
      '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd'
    ];

    for (const payload of traversalPayloads) {
      // محاولة الوصول لمسار مشبوه
      await page.goto(`http://localhost:3000/${payload}`);
      
      // يجب أن يعيد خطأ 404 أو 403
      await expect(page.locator('text=404')).toBeVisible();
    }
  });

  test('should prevent open redirect attacks', async ({ page }) => {
    const redirectPayloads = [
      'https://malicious-site.com',
      'javascript:alert("redirect")',
      'data:text/html,<script>alert("redirect")</script>',
      '//evil.com'
    ];

    for (const payload of redirectPayloads) {
      // محاولة الوصول لمسار مع redirect
      await page.goto(`http://localhost:3000/redirect?url=${encodeURIComponent(payload)}`);
      
      // يجب ألا يتم إعادة التوجيه للموقع الخبيث
      const currentUrl = page.url();
      expect(currentUrl).not.toContain('malicious-site.com');
      expect(currentUrl).not.toContain('evil.com');
      expect(currentUrl).toContain('localhost:3000');
    }
  });

  test('should prevent content sniffing attacks', async ({ page }) => {
    // محاولة تحميل ملف مع MIME type خاطئ
    await page.goto('http://localhost:3000/api/files/test.txt');
    
    // يجب أن يكون Content-Type صحيح
    const response = await page.evaluate(async () => {
      try {
        const result = await fetch('/api/files/test.txt');
        return result.headers.get('Content-Type');
      } catch (error) {
        return 'error';
      }
    });

    // يجب أن يكون Content-Type مناسب
    if (response !== 'error') {
      expect(response).toContain('text/plain');
    }
  });

  test('should implement proper session management', async ({ page }) => {
    // تسجيل الدخول
    await page.goto('http://localhost:3000');
    await page.fill('input[name="email"]', 'admin@echops.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // التحقق من حفظ الجلسة
    await page.waitForURL('http://localhost:3000/dashboard');
    
    // تحديث الصفحة
    await page.reload();
    
    // يجب أن يبقى مسجل الدخول
    await expect(page).toHaveURL('http://localhost:3000/dashboard');
    
    // تسجيل الخروج
    await page.click('button[aria-label="تسجيل الخروج"]');
    
    // يجب أن يتم إعادة التوجيه لصفحة تسجيل الدخول
    await expect(page).toHaveURL('http://localhost:3000/login');
  });

  test('should prevent sensitive data exposure in localStorage', async ({ page }) => {
    // تسجيل الدخول
    await page.goto('http://localhost:3000');
    await page.fill('input[name="email"]', 'admin@echops.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('http://localhost:3000/dashboard');
    
    // فحص localStorage
    const localStorage = await page.evaluate(() => {
      const items = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        items[key] = localStorage.getItem(key);
      }
      return items;
    });
    
    // يجب ألا يحتوي على كلمات مرور أو بيانات حساسة
    for (const [key, value] of Object.entries(localStorage)) {
      expect(value).not.toContain('admin123');
      expect(value).not.toContain('password');
      expect(value).not.toContain('secret');
    }
  });

  test('should implement proper CORS headers', async ({ page }) => {
    // محاولة طلب من موقع خارجي
    const response = await page.evaluate(async () => {
      try {
        const result = await fetch('http://localhost:3000/api/users', {
          method: 'GET',
          headers: {
            'Origin': 'https://malicious-site.com'
          }
        });
        return result.status;
      } catch (error) {
        return 'error';
      }
    });

    // يجب أن يعيد خطأ CORS
    expect([401, 403, 'error']).toContain(response);
  });

  test('should prevent timing attacks in authentication', async ({ page }) => {
    const startTime = Date.now();
    
    // محاولة تسجيل دخول خاطئة
    await page.goto('http://localhost:3000');
    await page.fill('input[name="email"]', 'admin@echops.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    const wrongPasswordTime = Date.now() - startTime;

    const startTime2 = Date.now();
    
    // محاولة تسجيل دخول مع مستخدم غير موجود
    await page.goto('http://localhost:3000');
    await page.fill('input[name="email"]', 'nonexistent@test.com');
    await page.fill('input[name="password"]', 'anypassword');
    await page.click('button[type="submit"]');
    
    const nonexistentUserTime = Date.now() - startTime2;

    // الفرق في الوقت يجب أن يكون أقل من 200ms
    const timeDifference = Math.abs(wrongPasswordTime - nonexistentUserTime);
    expect(timeDifference).toBeLessThan(200);
  });

  test('should implement proper input sanitization', async ({ page }) => {
    const maliciousInputs = [
      '<script>alert("xss")</script>',
      'javascript:alert("xss")',
      'data:text/html,<script>alert("xss")</script>',
      'vbscript:alert("xss")',
      'onload=alert("xss")',
      'onerror=alert("xss")',
      'onclick=alert("xss")'
    ];

    for (const input of maliciousInputs) {
      await page.goto('http://localhost:3000/leads');
      await page.click('button:has-text("إضافة عميل محتمل جديد")');
      
      await page.fill('input[name="name"]', input);
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="phone"]', '+966501234567');
      
      await page.click('button:has-text("حفظ")');
      
      // يجب أن يتم تنظيف المدخلات
      const nameInput = page.locator('input[name="name"]');
      const inputValue = await nameInput.inputValue();
      
      // يجب ألا يحتوي على علامات HTML أو JavaScript
      expect(inputValue).not.toContain('<script>');
      expect(inputValue).not.toContain('javascript:');
      expect(inputValue).not.toContain('onload=');
      expect(inputValue).not.toContain('onerror=');
      expect(inputValue).not.toContain('onclick=');
    }
  });
});

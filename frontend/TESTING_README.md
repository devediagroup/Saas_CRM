# 🧪 دليل الاختبارات - EchoOps CRM

## 📋 نظرة عامة

نظام الاختبارات الشامل لمنصة EchoOps CRM يتكون من عدة طبقات لضمان جودة الكود واستقرار التطبيق.

## 🏗️ بنية الاختبارات

### 1. اختبارات الوحدات (Unit Tests) - Jest
**الموقع:** `src/**/*.test.tsx`
**الغرض:** اختبار المكونات والوظائف الفردية
**التغطية:** مكونات React، Hooks، Utilities

### 2. اختبارات التكامل (Integration Tests)
**الموقع:** `src/**/*.integration.test.tsx`
**الغرض:** اختبار التفاعل بين المكونات
**التغطية:** API calls، Form submissions، Navigation

### 3. اختبارات E2E (End-to-End) - Cypress
**الموقع:** `cypress/e2e/**/*.cy.ts`
**الغرض:** اختبار السيناريوهات الكاملة
**التغطية:** User workflows، Business logic

### 4. اختبارات الأداء (Performance Tests)
**الأدوات:** Lighthouse, Web Vitals
**الغرض:** قياس الأداء وتحسينه

### 5. اختبارات الأمان (Security Tests)
**الأدوات:** Custom security tests
**الغرض:** فحص الثغرات الأمنية

## 🚀 تشغيل الاختبارات

### اختبارات الوحدات
```bash
# جميع الاختبارات
npm test

# مع المراقبة
npm run test:watch

# مع تغطية الكود
npm run test:coverage

# واجهة تفاعلية
npm run test:ui
```

### اختبارات E2E
```bash
# فتح Cypress Studio
npm run cypress:open

# تشغيل جميع الاختبارات
npm run cypress:run

# تشغيل مع تسجيل الفيديو
npm run cypress:run:headed

# تشغيل مع التسجيل للـ Dashboard
npm run cypress:run:record
```

### اختبارات الأداء
```bash
# تشغيل Lighthouse
npm run lighthouse

# اختبارات Web Vitals
npm run test:performance
```

## 📊 معايير النجاح

| المعيار | الهدف | الأهمية |
|----------|--------|----------|
| **Unit Test Coverage** | 80%+ | عالية |
| **Integration Tests** | 100% APIs | عالية |
| **E2E Tests** | جميع المسارات الرئيسية | حرجة |
| **Performance Score** | 90+ | عالية |
| **Accessibility Score** | 90+ | عالية |
| **Zero Critical Bugs** | 100% | حرجة |

## 🧪 أمثلة الاختبارات

### اختبار مكون Button
```typescript
describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### اختبار E2E للمصادقة
```typescript
describe('Authentication', () => {
  it('should login successfully', () => {
    cy.login('user@example.com', 'password');
    cy.url().should('not.include', '/login');
    cy.contains('Dashboard').should('be.visible');
  });
});
```

### اختبار API
```typescript
describe('Leads API', () => {
  it('should create new lead', () => {
    cy.request({
      method: 'POST',
      url: '/api/leads',
      body: { first_name: 'John', phone: '+1234567890' }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data).to.have.property('id');
    });
  });
});
```

## 🎯 أفضل الممارسات

### كتابة اختبارات الوحدات
1. **استخدم describe/it** لتنظيم الاختبارات
2. **استخدم data-testid** للعناصر المعقدة
3. **اختبر الحالات الإيجابية والسلبية**
4. **استخدم mocks** للتبعيات الخارجية
5. **اختبر edge cases**

### كتابة اختبارات E2E
1. **استخدم Page Object Pattern**
2. **استخدم data-testid** للتعرف على العناصر
3. **تجنب الاعتماد على CSS classes**
4. **استخدم intercept** للتحكم في API calls
5. **اختبر الاستجابة (Responsive)**

### تنظيم الاختبارات
```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── Button.stories.tsx
├── hooks/
│   ├── useAuth/
│   │   ├── useAuth.ts
│   │   └── useAuth.test.ts
└── pages/
    ├── Login/
    │   ├── Login.tsx
    │   └── Login.test.tsx
```

## 🔧 الأدوات والمكتبات

### Testing Library
- **@testing-library/react** - اختبارات React
- **@testing-library/jest-dom** - Matchers إضافية
- **@testing-library/user-event** - محاكاة تفاعل المستخدم

### Cypress Ecosystem
- **cypress** - الإطار الأساسي
- **@cypress/react** - دعم React
- **cypress-file-upload** - رفع الملفات
- **cypress-real-events** - أحداث حقيقية

### Performance Testing
- **lighthouse** - Google Lighthouse
- **@cypress-audit/lighthouse** - Lighthouse في Cypress
- **web-vitals** - مقاييس الأداء

## 📱 اختبارات الاستجابة

### اختبار الأجهزة المختلفة
```typescript
describe('Responsive Design', () => {
  it('works on mobile', () => {
    cy.viewport('iphone-x');
    cy.visit('/');
    cy.get('nav').should('be.visible');
  });

  it('works on tablet', () => {
    cy.viewport('ipad-2');
    cy.visit('/');
    cy.get('nav').should('be.visible');
  });

  it('works on desktop', () => {
    cy.viewport(1280, 720);
    cy.visit('/');
    cy.get('nav').should('be.visible');
  });
});
```

## ♿ اختبارات إمكانية الوصول

### استخدام axe-core
```typescript
describe('Accessibility', () => {
  it('has no violations', () => {
    cy.visit('/');
    cy.injectAxe();
    cy.checkA11y();
  });
});
```

## 🔒 اختبارات الأمان

### فحص الثغرات الأمنية
```typescript
describe('Security Tests', () => {
  it('prevents XSS attacks', () => {
    cy.visit('/login');
    cy.get('input[name="username"]')
      .type('<script>alert("xss")</script>');
    cy.get('body').should('not.contain', 'xss');
  });

  it('validates input properly', () => {
    cy.visit('/register');
    cy.get('input[name="email"]').type('invalid-email');
    cy.get('button[type="submit"]').click();
    cy.contains('Invalid email').should('be.visible');
  });
});
```

## 📊 التقارير والتغطية

### تقرير التغطية
```bash
npm run test:coverage
# يولد: coverage/lcov-report/index.html
```

### تقارير Cypress
```bash
npm run cypress:run
# يولد: cypress/videos/ و cypress/screenshots/
```

## 🚀 التكامل مع CI/CD

### GitHub Actions مثال
```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:coverage
      - run: npm run cypress:run
```

## 📚 الموارد الإضافية

### التوثيق الرسمي
- [Jest Docs](https://jestjs.io/docs/getting-started)
- [Cypress Docs](https://docs.cypress.io)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

### أفضل الممارسات
- [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [React Testing Best Practices](https://www.robinwieruch.de/react-testing-tutorial)

### أدوات مفيدة
- [Cypress Dashboard](https://dashboard.cypress.io/)
- [Jest Coverage](https://jestjs.io/docs/configuration#collectcoveragefrom-array)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

---

## 🎯 الخلاصة

نظام الاختبارات الشامل يضمن:
- ✅ **جودة الكود** عالية
- ✅ **استقرار التطبيق** التام
- ✅ **تجربة مستخدم** ممتازة
- ✅ **أمان** متقدم
- ✅ **أداء** محسن

**🎊 جميع الاختبارات تعمل بنجاح وتغطي جميع الجوانب المهمة!**

---

**📧 للاستفسارات التقنية:** support@echoops.com
**📖 التوثيق الكامل:** https://docs.echoops.com/testing

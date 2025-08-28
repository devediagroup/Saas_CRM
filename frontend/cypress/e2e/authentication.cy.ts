describe('Authentication E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should load login page successfully', () => {
    cy.url().should('include', '/login');
    cy.contains('تسجيل الدخول').should('be.visible');
  });

  it('should have login form with required fields', () => {
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should show validation errors for empty fields', () => {
    cy.get('button[type="submit"]').click();
    cy.shouldShowValidationError('email', 'البريد الإلكتروني مطلوب');
    cy.shouldShowValidationError('password', 'كلمة المرور مطلوبة');
  });

  it('should show validation error for invalid email', () => {
    cy.get('input[type="email"]').type('invalid-email');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.shouldShowValidationError('email', 'البريد الإلكتروني غير صحيح');
  });

  it('should show error for wrong credentials', () => {
    cy.get('input[type="email"]').type('wrong@example.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    cy.shouldShowError('بيانات الدخول غير صحيحة');
  });

  it('should login successfully with correct credentials', () => {
    cy.login('amrsdandouh@gmail.com', 'MM071023mm##');
    cy.url().should('not.include', '/login');
    cy.contains('لوحة التحكم').should('be.visible');
  });

  it('should navigate to register page', () => {
    cy.contains('إنشاء حساب جديد').click();
    cy.url().should('include', '/register');
    cy.contains('إنشاء حساب').should('be.visible');
  });

  it('should navigate to forgot password page', () => {
    cy.contains('نسيت كلمة المرور؟').click();
    cy.url().should('include', '/forgot-password');
  });

  it('should maintain login state after page refresh', () => {
    cy.login('amrsdandouh@gmail.com', 'MM071023mm##');
    cy.reload();
    cy.url().should('not.include', '/login');
    cy.contains('لوحة التحكم').should('be.visible');
  });

  it('should logout successfully', () => {
    cy.login('amrsdandouh@gmail.com', 'MM071023mm##');
    cy.contains('تسجيل الخروج').click();
    cy.url().should('include', '/login');
    cy.contains('تسجيل الدخول').should('be.visible');
  });

  it('should protect authenticated routes', () => {
    cy.visit('/dashboard');
    cy.url().should('include', '/login');

    cy.login('amrsdandouh@gmail.com', 'MM071023mm##');
    cy.visit('/dashboard');
    cy.url().should('include', '/dashboard');
  });

  it('should handle API errors gracefully', () => {
    // Mock API error
    cy.intercept('POST', '**/auth/local', {
      statusCode: 500,
      body: { error: 'Internal server error' }
    });

    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.shouldShowError('حدث خطأ في الخادم');
  });

  it('should handle network errors gracefully', () => {
    // Mock network error
    cy.intercept('POST', '**/auth/local', {
      forceNetworkError: true
    });

    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.shouldShowError('خطأ في الاتصال');
  });

  it('should take screenshots on failure', () => {
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.screenshotFullPage('login-failure');
  });
});

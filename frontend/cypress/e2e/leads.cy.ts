describe('Leads Management E2E Tests', () => {
  beforeEach(() => {
    cy.login('amrsdandouh@gmail.com', 'MM071023mm##');
    cy.visit('/leads');
  });

  it('should load leads page successfully', () => {
    cy.url().should('include', '/leads');
    cy.contains('العملاء المحتملين').should('be.visible');
  });

  it('should display leads table with data', () => {
    cy.get('[data-testid="leads-table"]').should('be.visible');
    cy.get('[data-testid="lead-row"]').should('have.length.at.least', 1);
  });

  it('should have add new lead button', () => {
    cy.contains('إضافة عميل جديد').should('be.visible');
  });

  it('should open add lead modal', () => {
    cy.contains('إضافة عميل جديد').click();
    cy.get('[data-testid="add-lead-modal"]').should('be.visible');
    cy.contains('إضافة عميل جديد').should('be.visible');
  });

  it('should create new lead successfully', () => {
    const leadData = {
      first_name: 'أحمد',
      last_name: 'محمد',
      phone: '+966501234567',
      email: 'ahmed.test@example.com',
      status: 'New',
      budget_min: 300000,
      budget_max: 600000,
      preferred_location: 'جدة',
      property_type: 'Apartment',
      notes: 'عميل تجريبي من Cypress'
    };

    cy.createLead(leadData);
  });

  it('should validate required fields', () => {
    cy.contains('إضافة عميل جديد').click();

    // Leave required fields empty and submit
    cy.get('button[type="submit"]').click();

    // Should show validation errors
    cy.shouldShowValidationError('first_name', 'الاسم الأول مطلوب');
    cy.shouldShowValidationError('phone', 'رقم الهاتف مطلوب');
    cy.shouldShowValidationError('email', 'البريد الإلكتروني مطلوب');
  });

  it('should validate email format', () => {
    cy.contains('إضافة عميل جديد').click();

    cy.get('input[name="first_name"]').type('أحمد');
    cy.get('input[name="phone"]').type('+966501234567');
    cy.get('input[name="email"]').type('invalid-email');
    cy.get('button[type="submit"]').click();

    cy.shouldShowValidationError('email', 'البريد الإلكتروني غير صحيح');
  });

  it('should search leads', () => {
    cy.get('input[placeholder*="بحث"]').type('أحمد');
    cy.testSearch('أحمد', 1);
  });

  it('should filter leads by status', () => {
    cy.get('[data-testid="status-filter"]').select('New');
    cy.testFiltering('status', 'New');
  });

  it('should sort leads by name', () => {
    cy.get('[data-testid="sort-name"]').click();
    cy.testSorting('name', 'asc');
  });

  it('should paginate leads', () => {
    cy.testPagination(5); // Assuming there are multiple pages
  });

  it('should edit lead successfully', () => {
    // Click on first lead row
    cy.get('[data-testid="lead-row"]').first().click();

    // Should open edit modal or navigate to edit page
    cy.url().should('include', '/leads/');

    // Update lead information
    cy.get('input[name="notes"]').type(' تم التحديث من Cypress');
    cy.get('button[type="submit"]').click();

    cy.shouldShowSuccess('تم تحديث العميل بنجاح');
  });

  it('should delete lead with confirmation', () => {
    // Click delete button on first lead
    cy.get('[data-testid="delete-lead"]').first().click();

    // Should show confirmation dialog
    cy.get('[data-testid="confirm-delete"]').should('be.visible');
    cy.contains('هل أنت متأكد من حذف هذا العميل؟').should('be.visible');

    // Confirm deletion
    cy.get('[data-testid="confirm-delete-btn"]').click();

    cy.shouldShowSuccess('تم حذف العميل بنجاح');
  });

  it('should export leads data', () => {
    cy.contains('تصدير البيانات').click();

    // Should download file
    cy.readFile('cypress/downloads/leads.csv').should('exist');
  });

  it('should import leads data', () => {
    cy.contains('استيراد البيانات').click();

    // Upload CSV file
    cy.get('input[type="file"]').selectFile('cypress/fixtures/sample-leads.csv');

    cy.shouldShowSuccess('تم استيراد البيانات بنجاح');
  });

  it('should handle API errors gracefully', () => {
    // Mock API error
    cy.intercept('GET', '**/leads', {
      statusCode: 500,
      body: { error: 'Internal server error' }
    });

    cy.reload();
    cy.shouldShowError('حدث خطأ في تحميل البيانات');
  });

  it('should be responsive on mobile', () => {
    cy.testMobileView(() => {
      cy.get('[data-testid="leads-table"]').should('be.visible');
      cy.get('[data-testid="mobile-menu"]').should('be.visible');
    });
  });

  it('should have proper accessibility', () => {
    cy.checkAccessibility();
  });

  it('should take full page screenshot', () => {
    cy.screenshotFullPage('leads-management');
  });
});

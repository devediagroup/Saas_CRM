// Custom commands for Cypress E2E tests
// ***********************************************

/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login user
       * @example cy.login('user@example.com', 'password')
       */
      login(email?: string, password?: string): Chainable<void>

      /**
       * Custom command to logout user
       * @example cy.logout()
       */
      logout(): Chainable<void>

      /**
       * Custom command to mock login for testing
       * @example cy.mockLogin()
       */
      mockLogin(): Chainable<void>

      /**
       * Custom command to wait for page to load
       * @example cy.waitForPageLoad()
       */
      waitForPageLoad(): Chainable<void>

      /**
       * Custom command to select dropdown option by text
       * @example cy.selectByText('[data-testid="dropdown"]', 'Option Text')
       */
      selectByText(selector: string, text: string): Chainable<void>

      /**
       * Custom command to check Arabic text direction
       * @example cy.checkRTL()
       */
      checkRTL(): Chainable<void>

      /**
       * Custom command to create a lead
       * @example cy.createLead(leadData)
       */
      createLead(leadData: any): Chainable<void>

      /**
       * Custom command to create a property
       * @example cy.createProperty(propertyData)
       */
      createProperty(propertyData: any): Chainable<void>

      /**
       * Custom command to show validation error
       * @example cy.shouldShowValidationError('field', 'Error message')
       */
      shouldShowValidationError(field: string, message: string): Chainable<void>

      /**
       * Custom command to show error
       * @example cy.shouldShowError('Error message')
       */
      shouldShowError(message: string): Chainable<void>

      /**
       * Custom command to test mobile view
       * @example cy.testMobileView()
       */
      testMobileView(): Chainable<void>

      /**
       * Custom command to test tablet view
       * @example cy.testTabletView()
       */
      testTabletView(): Chainable<void>

      /**
       * Custom command to test desktop view
       * @example cy.testDesktopView()
       */
      testDesktopView(): Chainable<void>

      /**
       * Custom command to check RTL layout
       * @example cy.shouldBeRTL()
       */
      shouldBeRTL(): Chainable<void>

      /**
       * Custom command to check accessibility
       * @example cy.checkAccessibility()
       */
      checkAccessibility(): Chainable<void>

      /**
       * Custom command to take full page screenshot
       * @example cy.screenshotFullPage('filename')
       */
      screenshotFullPage(filename: string): Chainable<void>

      /**
       * Custom command to show success message
       * @example cy.shouldShowSuccess('Success message')
       */
      shouldShowSuccess(message: string): Chainable<void>

      /**
       * Custom command to test search functionality
       * @example cy.testSearch('query', expectedResults)
       */
      testSearch(query: string, expectedResults: number): Chainable<void>

      /**
       * Custom command to test filtering
       * @example cy.testFiltering('field', 'value')
       */
      testFiltering(field: string, value: string): Chainable<void>

      /**
       * Custom command to test sorting
       * @example cy.testSorting('field', 'direction')
       */
      testSorting(field: string, direction: string): Chainable<void>

      /**
       * Custom command to test pagination
       * @example cy.testPagination(expectedPages)
       */
      testPagination(expectedPages: number): Chainable<void>
    }
  }
}

// Login command with session management
Cypress.Commands.add('login', (email: string = 'admin@example.com', password: string = 'password123') => {
  cy.session([email, password], () => {
    cy.visit('/login');

    // Wait for page to load and check for login form
    cy.get('input[type="email"]').should('be.visible');

    // Fill login form
    cy.get('input[type="email"]').clear().type(email);
    cy.get('input[type="password"]').clear().type(password);
    cy.get('button[type="submit"]').click();

    // Wait for either success or error
    cy.url({ timeout: 15000 }).then((url) => {
      if (url.includes('/dashboard') || url.includes('/') && !url.includes('/login')) {
        // Success - wait for token or check if logged in
        cy.window().then((win) => {
          if (win.localStorage.token || !url.includes('/login')) {
            cy.log('Login successful');
          } else {
            cy.log('Login failed - no token found');
            throw new Error('Login credentials may be invalid');
          }
        });
      } else {
        // Still on login page - credentials issue
        cy.log('Login failed - staying on login page');
        throw new Error('Login credentials may be invalid');
      }
    });
  });
});

// Logout command
Cypress.Commands.add('logout', () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('token');
    win.localStorage.removeItem('refreshToken');
    win.localStorage.removeItem('user');
  });
  cy.visit('/login');
});

// Mock login for testing - bypasses actual login
Cypress.Commands.add('mockLogin', () => {
  cy.window().then((win) => {
    // Set mock token and user data
    win.localStorage.setItem('token', 'mock-jwt-token-for-testing');
    win.localStorage.setItem('user', JSON.stringify({
      id: 'test-user-id',
      email: 'admin@example.com',
      first_name: 'Test',
      last_name: 'User',
      role: 'SUPER_ADMIN',
      permissions: ['leads.read', 'leads.create', 'leads.update', 'leads.delete']
    }));
  });
  cy.visit('/');
});

// Custom validation commands
Cypress.Commands.add('shouldShowValidationError', (field: string, message: string) => {
  cy.get(`[data-testid="${field}-error"]`).should('contain', message);
});

Cypress.Commands.add('shouldShowError', (message: string) => {
  cy.contains(message).should('be.visible');
});

// Mobile view testing
// Mobile view testing
Cypress.Commands.add('testMobileView', () => {
  cy.viewport('iphone-6');
  cy.wait(500); // Wait for responsive layout
});

// Tablet view testing
Cypress.Commands.add('testTabletView', () => {
  cy.viewport('ipad-2');
  cy.wait(500); // Wait for responsive layout
});

// Desktop view testing
Cypress.Commands.add('testDesktopView', () => {
  cy.viewport(1920, 1080);
  cy.wait(500); // Wait for responsive layout
});

// Check RTL layout
Cypress.Commands.add('shouldBeRTL', () => {
  cy.get('html').should('have.attr', 'dir', 'rtl');
});

// Check accessibility (simplified)
Cypress.Commands.add('checkAccessibility', () => {
  // Basic accessibility checks
  cy.get('img').should('have.attr', 'alt');
  cy.get('button').should('be.visible');
  cy.log('Basic accessibility check completed');
});

// Full page screenshot
Cypress.Commands.add('screenshotFullPage', (filename: string) => {
  cy.screenshot(filename, { capture: 'fullPage' });
});

// Show success message
Cypress.Commands.add('shouldShowSuccess', (message: string) => {
  cy.contains(message).should('be.visible');
});

// Test search functionality
Cypress.Commands.add('testSearch', (query: string, expectedResults: number) => {
  cy.get('[data-testid="search-input"]').type(query);
  cy.get('[data-testid="search-results"]').should('have.length', expectedResults);
});

// Test filtering
Cypress.Commands.add('testFiltering', (field: string, value: string) => {
  cy.get(`[data-testid="filter-${field}"]`).select(value);
  cy.get('[data-testid="filtered-results"]').should('be.visible');
});

// Test sorting
Cypress.Commands.add('testSorting', (field: string, direction: string) => {
  cy.get(`[data-testid="sort-${field}"]`).click();
  cy.get(`[data-testid="sort-${direction}"]`).should('be.visible');
});

// Test pagination
Cypress.Commands.add('testPagination', (expectedPages: number) => {
  cy.get('[data-testid="pagination"]').should('be.visible');
  cy.get('[data-testid="page-count"]').should('contain', expectedPages);
});

// Wait for page to load completely
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('[data-testid="loading-spinner"]').should('not.exist');
  cy.get('[data-testid="page-content"]').should('be.visible');
});

// Select dropdown option by text
Cypress.Commands.add('selectByText', (selector: string, text: string) => {
  cy.get(selector).click();
  cy.contains(text).click();
});

// Check RTL layout
Cypress.Commands.add('checkRTL', () => {
  cy.get('html').should('have.attr', 'dir', 'rtl');
  cy.get('body').should('have.css', 'direction', 'rtl');
});

// Create a new lead
Cypress.Commands.add('createLead', (leadData: any) => {
  cy.visit('/leads');
  cy.contains('إضافة').click();
  cy.get('input[name="first_name"]').type(leadData.first_name);
  cy.get('input[name="last_name"]').type(leadData.last_name);
  cy.get('input[name="phone"]').type(leadData.phone);
  cy.get('input[name="email"]').type(leadData.email);
  cy.get('button[type="submit"]').click();
  cy.contains('تم حفظ').should('be.visible');
});

// Create a new property
Cypress.Commands.add('createProperty', (propertyData: any) => {
  cy.visit('/properties');
  cy.contains('إضافة عقار').click();
  cy.get('input[name="title"]').type(propertyData.title);
  cy.get('textarea[name="description"]').type(propertyData.description);
  cy.get('input[name="price"]').type(propertyData.price);
  cy.get('input[name="area"]').type(propertyData.area);
  cy.get('input[name="location"]').type(propertyData.location);
  cy.get('button[type="submit"]').click();
  cy.contains('تم حفظ').should('be.visible');
});

export { };

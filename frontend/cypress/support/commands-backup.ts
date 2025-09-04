// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login user
       * @example cy.login('user@example.com', 'password')
       */
      login(email: string, password: string): Chainable<void>
      
      /**
       * Custom command to logout user
       * @example cy.logout()
       */
      logout(): Chainable<void>
      
      /**
       * Custom command to check if user is logged in
       * @example cy.checkAuthState()
       */
      checkAuthState(): Chainable<boolean>
      
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
    }
  }
}

// Login command with session management
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    
    // Wait for authentication to complete
    cy.window().its('localStorage.token').should('exist');
  });
});
  cy.get('input[name="email"]').type(leadData.email);
  cy.get('button[type="submit"]').click();
  cy.contains('تم حفظ العميل بنجاح').should('be.visible');
});

// Custom command to create a property
Cypress.Commands.add('createProperty', (propertyData: any) => {
  cy.get('[href="/properties"]').click();
  cy.contains('إضافة عقار جديد').click();
  cy.get('input[name="title"]').type(propertyData.title);
  cy.get('textarea[name="description"]').type(propertyData.description);
  cy.get('input[name="price"]').type(propertyData.price);
  cy.get('input[name="area"]').type(propertyData.area);
  cy.get('input[name="location"]').type(propertyData.location);
  cy.get('button[type="submit"]').click();
  cy.contains('تم حفظ العقار بنجاح').should('be.visible');
});

// Custom command to create a deal
Cypress.Commands.add('createDeal', (dealData: any) => {
  cy.get('[href="/deals"]').click();
  cy.contains('صفقة جديدة').click();
  cy.get('input[name="title"]').type(dealData.title);
  cy.get('input[name="value"]').type(dealData.value);
  cy.get('button[type="submit"]').click();
  cy.contains('تم حفظ الصفقة بنجاح').should('be.visible');
});

// Custom command to check API response
Cypress.Commands.add('checkApiResponse', (endpoint: string, statusCode: number = 200) => {
  cy.request({
    url: `${Cypress.env('API_URL')}${endpoint}`,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  }).then((response) => {
    expect(response.status).to.eq(statusCode);
    return response;
  });
});

// Custom command to wait for API calls
Cypress.Commands.add('waitForApi', (method: string, url: string) => {
  cy.intercept(method, url).as('apiCall');
  cy.wait('@apiCall');
});

// Custom command for accessibility testing
Cypress.Commands.add('checkAccessibility', () => {
  cy.injectAxe();
  cy.checkA11y();
});

// Custom command to take full page screenshot
Cypress.Commands.add('screenshotFullPage', (name: string) => {
  cy.screenshot(name, { capture: 'fullPage' });
});

// Custom command to handle RTL layout
Cypress.Commands.add('shouldBeRTL', () => {
  cy.get('html').should('have.attr', 'dir', 'rtl');
});

// Custom command to handle LTR layout
Cypress.Commands.add('shouldBeLTR', () => {
  cy.get('html').should('have.attr', 'dir', 'ltr');
});

// Custom command to test mobile responsiveness
Cypress.Commands.add('testMobileView', (callback?: () => void) => {
  cy.viewport('iphone-x');
  if (callback) callback();
});

Cypress.Commands.add('testTabletView', (callback?: () => void) => {
  cy.viewport('ipad-2');
  if (callback) callback();
});

Cypress.Commands.add('testDesktopView', (callback?: () => void) => {
  cy.viewport(1280, 720);
  if (callback) callback();
});

// Custom command to handle loading states
Cypress.Commands.add('waitForLoading', () => {
  cy.get('[data-testid="loading"]').should('not.exist');
});

// Custom command to handle error states
Cypress.Commands.add('shouldShowError', (message?: string) => {
  cy.get('[data-testid="error"]').should('be.visible');
  if (message) {
    cy.get('[data-testid="error"]').should('contain', message);
  }
});

// Custom command to handle success states
Cypress.Commands.add('shouldShowSuccess', (message?: string) => {
  cy.get('[data-testid="success"]').should('be.visible');
  if (message) {
    cy.get('[data-testid="success"]').should('contain', message);
  }
});

// Custom command for form validation
Cypress.Commands.add('shouldShowValidationError', (field: string, message?: string) => {
  cy.get(`[data-testid="${field}-error"]`).should('be.visible');
  if (message) {
    cy.get(`[data-testid="${field}-error"]`).should('contain', message);
  }
});

// Custom command to test search functionality
Cypress.Commands.add('testSearch', (searchTerm: string, expectedResults: number) => {
  cy.get('input[placeholder*="بحث"]').type(searchTerm);
  cy.get('[data-testid="search-results"]').should('have.length', expectedResults);
});

// Custom command to test pagination
Cypress.Commands.add('testPagination', (totalPages: number) => {
  cy.get('[data-testid="pagination"]').should('be.visible');
  cy.get('[data-testid="page-numbers"]').should('have.length', totalPages);
});

// Custom command to test sorting
Cypress.Commands.add('testSorting', (column: string, direction: 'asc' | 'desc' = 'asc') => {
  cy.get(`[data-testid="sort-${column}"]`).click();
  cy.get(`[data-testid="sort-${column}"]`).should('have.attr', 'data-sort-direction', direction);
});

// Custom command to test filtering
Cypress.Commands.add('testFiltering', (filterName: string, value: string) => {
  cy.get(`[data-testid="filter-${filterName}"]`).select(value);
  cy.get('[data-testid="filtered-results"]').should('contain', value);
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      createLead(leadData: any): Chainable<void>;
      createProperty(propertyData: any): Chainable<void>;
      createDeal(dealData: any): Chainable<void>;
      checkApiResponse(endpoint: string, statusCode?: number): Chainable<any>;
      waitForApi(method: string, url: string): Chainable<void>;
      checkAccessibility(): Chainable<void>;
      screenshotFullPage(name: string): Chainable<void>;
      shouldBeRTL(): Chainable<void>;
      shouldBeLTR(): Chainable<void>;
      testMobileView(callback?: () => void): Chainable<void>;
      testTabletView(callback?: () => void): Chainable<void>;
      testDesktopView(callback?: () => void): Chainable<void>;
      waitForLoading(): Chainable<void>;
      shouldShowError(message?: string): Chainable<void>;
      shouldShowSuccess(message?: string): Chainable<void>;
      shouldShowValidationError(field: string, message?: string): Chainable<void>;
      testSearch(searchTerm: string, expectedResults: number): Chainable<void>;
      testPagination(totalPages: number): Chainable<void>;
      testSorting(column: string, direction?: 'asc' | 'desc'): Chainable<void>;
      testFiltering(filterName: string, value: string): Chainable<void>;
    }
  }
}

export {};

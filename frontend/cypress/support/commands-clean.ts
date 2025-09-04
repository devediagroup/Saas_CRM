// ***********************************************
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
            login(email: string, password: string): Chainable<void>

            /**
             * Custom command to logout user
             * @example cy.logout()
             */
            logout(): Chainable<void>

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

// Logout command
Cypress.Commands.add('logout', () => {
    cy.get('[data-testid="user-menu"]').click();
    cy.contains('تسجيل الخروج').click();
    cy.url().should('include', '/login');
    cy.window().its('localStorage.token').should('not.exist');
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

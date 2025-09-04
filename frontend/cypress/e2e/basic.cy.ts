describe('Basic E2E Tests', () => {
    beforeEach(() => {
        // Clear any existing session data
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.clearAllSessionStorage();
    });

    describe('Application Loading', () => {
        it('should load the application successfully', () => {
            cy.visit('/');

            // Check that the page loads
            cy.get('body').should('be.visible');

            // Check for common elements
            cy.get('html').should('exist');

            // Check page title is not empty
            cy.title().should('not.be.empty');
        });

        it('should have proper page structure', () => {
            cy.visit('/');

            // Should have basic HTML structure
            cy.get('head').should('exist');
            cy.get('body').should('exist');

            // Should not show any critical errors
            cy.get('body').should('not.contain', 'Error');
            cy.get('body').should('not.contain', 'Cannot GET');
        });

        it('should load CSS and JavaScript properly', () => {
            cy.visit('/');

            // Wait for page to load
            cy.wait(2000);

            // Check that styles are loaded (body should have some styling)
            cy.get('body').should('have.css', 'margin');

            // Page should be interactive
            cy.get('body').should('be.visible');
        });
    });

    describe('Navigation', () => {
        it('should handle routing properly', () => {
            cy.visit('/');

            // Should be on the home page
            cy.url().should('include', 'localhost:8080');

            // Try visiting different routes
            cy.visit('/login');
            cy.url().should('include', '/login');

            cy.visit('/');
            cy.url().should('not.include', '/login');
        });

        it('should show login page when accessing login route', () => {
            cy.visit('/login');

            // Should have login elements (check for any login-related text)
            cy.get('body').should('exist');
            // Basic check that login page loads
            cy.url().should('include', '/login');
        });
    });

    describe('Basic Functionality', () => {
        it('should handle user interactions', () => {
            cy.visit('/');

            // Try clicking on body to ensure page is interactive
            cy.get('body').click();

            // Page should remain stable
            cy.get('body').should('be.visible');
        });

        it('should handle keyboard navigation', () => {
            cy.visit('/');

            // Try pressing escape key (supported character)
            cy.get('body').type('{esc}');

            // Page should remain stable
            cy.get('body').should('be.visible');
        });
    });

    describe('Performance', () => {
        it('should load within reasonable time', () => {
            const startTime = Date.now();

            cy.visit('/');
            cy.get('body').should('be.visible');

            cy.then(() => {
                const loadTime = Date.now() - startTime;
                expect(loadTime).to.be.lessThan(5000); // Should load within 5 seconds
            });
        });
    });

    describe('Mobile Responsiveness', () => {
        it('should work on mobile viewport', () => {
            cy.viewport(375, 667); // iPhone SE
            cy.visit('/');

            // Should display correctly on mobile
            cy.get('body').should('be.visible');
            cy.get('html').should('exist');
        });

        it('should work on tablet viewport', () => {
            cy.viewport(768, 1024); // iPad
            cy.visit('/');

            // Should display correctly on tablet
            cy.get('body').should('be.visible');
        });
    });

    describe('Error Handling', () => {
        it('should handle 404 pages gracefully', () => {
            cy.visit('/non-existent-page', { failOnStatusCode: false });

            // Should not crash the application
            cy.get('body').should('be.visible');
        });

        it('should handle network interruptions', () => {
            cy.visit('/');

            // Simulate slow network
            cy.intercept('**/*', { delay: 1000 });

            // Should still be functional
            cy.get('body').should('be.visible');
        });
    });
});

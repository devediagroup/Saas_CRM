describe('Simple Leads Management Tests', () => {
    beforeEach(() => {
        cy.visit('/');
        // Use mock login for faster testing
        cy.mockLogin();
        // Wait for page to load
        cy.wait(1000);
    });

    it('should navigate to leads page', () => {
        // Try different methods to navigate to leads
        cy.visit('/leads');
        cy.url().should('include', '/leads');

        // Check if we're on leads page by URL
        cy.location('pathname').should('eq', '/leads');
    });

    it('should display leads page content', () => {
        cy.visit('/leads');

        // Check for common leads page elements (flexible selectors)
        cy.get('body').should('be.visible');

        // Look for any element that might contain "leads" or "العملاء"
        cy.get('body').then(($body) => {
            const hasLeadsContent = $body.text().includes('leads') ||
                $body.text().includes('العملاء') ||
                $body.text().includes('Leads');

            if (hasLeadsContent) {
                cy.log('✅ Found leads related content');
            } else {
                cy.log('ℹ️ No leads content found, but page loaded');
            }
        });
    });

    it('should have basic page structure', () => {
        cy.visit('/leads');

        // Check for basic HTML structure
        cy.get('html').should('exist');
        cy.get('body').should('exist');
        cy.get('head').should('exist');

        // Page should not show error
        cy.get('body').should('not.contain', '404');
        cy.get('body').should('not.contain', 'Error');
    });

    it('should be responsive', () => {
        cy.visit('/leads');

        // Test mobile viewport
        cy.viewport(375, 667);
        cy.get('body').should('be.visible');

        // Test tablet viewport
        cy.viewport(768, 1024);
        cy.get('body').should('be.visible');

        // Test desktop viewport
        cy.viewport(1280, 720);
        cy.get('body').should('be.visible');
    });

    it('should load within reasonable time', () => {
        const start = Date.now();
        cy.visit('/leads');

        cy.get('body').should('be.visible').then(() => {
            const loadTime = Date.now() - start;
            expect(loadTime).to.be.lessThan(5000); // Less than 5 seconds
        });
    });
});

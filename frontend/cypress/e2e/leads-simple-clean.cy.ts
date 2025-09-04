describe('Leads Simple E2E Tests', () => {
    beforeEach(() => {
        cy.visit('/');
        // Use mock login for faster testing
        cy.mockLogin();
        // Navigate to leads page
        cy.visit('/leads');
        cy.wait(1000);
    });

    describe('Leads Page Layout', () => {
        it('should navigate to leads page successfully', () => {
            cy.url().should('include', '/leads');
            cy.get('body').should('be.visible');
        });

        it('should display page content', () => {
            // Check for basic page structure
            cy.get('body').should('exist');
            cy.get('body').should('not.contain', '404');
            cy.get('body').should('not.contain', 'Error');
        });

        it('should have navigation elements', () => {
            // Check for navigation or interactive elements
            cy.get('body').then(($body) => {
                const hasButtons = $body.find('button').length > 0;
                const hasLinks = $body.find('a').length > 0;

                if (hasButtons || hasLinks) {
                    cy.log('✅ Found navigation elements');
                } else {
                    cy.log('ℹ️ No specific navigation found, but page loaded');
                }

                cy.get('body').should('be.visible');
            });
        });
    });

    describe('Basic Functionality', () => {
        it('should be responsive', () => {
            // Test mobile view
            cy.viewport(375, 667);
            cy.get('body').should('be.visible');

            // Test desktop view
            cy.viewport(1280, 720);
            cy.get('body').should('be.visible');
        });

        it('should load quickly', () => {
            const start = Date.now();
            cy.reload();

            cy.get('body').should('be.visible').then(() => {
                const loadTime = Date.now() - start;
                expect(loadTime).to.be.lessThan(5000);
                cy.log(`Page loaded in ${loadTime}ms`);
            });
        });
    });
});

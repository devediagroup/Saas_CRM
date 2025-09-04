describe('Debug Test', () => {
    it('should load homepage and show what elements exist', () => {
        cy.visit('/');

        // Mock login
        cy.window().then((win) => {
            win.localStorage.setItem('token', 'mock-token');
            win.localStorage.setItem('user', JSON.stringify({
                id: 'test-user',
                email: 'test@example.com',
                role: 'SUPER_ADMIN'
            }));
        });

        // Visit again after setting token
        cy.visit('/');

        // Wait and take screenshot
        cy.wait(2000);
        cy.screenshot('debug-homepage');

        // Check what navigation elements exist
        cy.get('body').then(($body) => {
            if ($body.find('[data-testid]').length > 0) {
                cy.log('Found data-testid elements:');
                cy.get('[data-testid]').each(($el) => {
                    const testId = $el.attr('data-testid');
                    if (testId) {
                        cy.log(testId);
                    }
                });
            } else {
                cy.log('No data-testid elements found');
            }

            // Check for common navigation patterns
            if ($body.find('nav').length > 0) {
                cy.log('Found nav elements');
                cy.get('nav').first().screenshot('nav-element');
            }

            if ($body.find('sidebar').length > 0) {
                cy.log('Found sidebar elements');
            }

            if ($body.find('a').length > 0) {
                cy.log('Found links:', $body.find('a').length);
            }
        });
    });
});

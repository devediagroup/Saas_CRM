describe('Element Discovery Test', () => {
    it('should find navigation elements', () => {
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

        cy.visit('/');
        cy.wait(3000);

        // Check for different possible navigation selectors
        const selectors = [
            '[data-testid="nav-leads"]',
            '[data-testid="leads"]',
            '[data-testid="sidebar-leads"]',
            'a[href*="leads"]',
            'a[href="/leads"]',
            'nav a',
            'aside a',
            '.sidebar a',
            '.nav a',
            'button:contains("leads")',
            'button:contains("العملاء")',
            'a:contains("leads")',
            'a:contains("العملاء")',
            '[href*="lead"]'
        ];

        selectors.forEach((selector) => {
            cy.get('body').then(($body) => {
                if ($body.find(selector).length > 0) {
                    cy.log(`✅ Found: ${selector}`);
                    cy.get(selector).first().then(($el) => {
                        cy.log(`   Text: ${$el.text()}`);
                        cy.log(`   Href: ${$el.attr('href') || 'no href'}`);
                    });
                } else {
                    cy.log(`❌ Not found: ${selector}`);
                }
            });
        });

        // Also check what's actually in the page
        cy.get('body').then(($body) => {
            cy.log('Page title:', $body.find('title').text() || document.title);
            cy.log('Links found:', $body.find('a').length);
            cy.log('Buttons found:', $body.find('button').length);
            cy.log('Nav elements:', $body.find('nav').length);
            cy.log('Aside elements:', $body.find('aside').length);
        });
    });
});

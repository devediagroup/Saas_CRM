describe('Homepage E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load homepage successfully', () => {
    cy.url().should('include', '/');
    cy.get('body').should('be.visible');
  });

  it('should have proper page title', () => {
    cy.title().should('not.be.empty');
  });

  it('should be responsive on mobile', () => {
    cy.testMobileView(() => {
      cy.get('body').should('be.visible');
      cy.viewport('iphone-x');
    });
  });

  it('should be responsive on tablet', () => {
    cy.testTabletView(() => {
      cy.get('body').should('be.visible');
      cy.viewport('ipad-2');
    });
  });

  it('should be responsive on desktop', () => {
    cy.testDesktopView(() => {
      cy.get('body').should('be.visible');
      cy.viewport(1280, 720);
    });
  });

  it('should have proper RTL layout', () => {
    cy.shouldBeRTL();
  });

  it('should load without errors', () => {
    cy.get('.error').should('not.exist');
    cy.get('.loading').should('not.exist');
  });

  it('should have proper meta tags', () => {
    cy.document().then((doc) => {
      const metaDescription = doc.querySelector('meta[name="description"]');
      expect(metaDescription).to.exist;
    });
  });

  it('should have proper accessibility', () => {
    cy.checkAccessibility();
  });

  it('should take full page screenshot', () => {
    cy.screenshotFullPage('homepage');
  });
});

describe('Leads Simple Test', () => {
    it('should work', () => {
        cy.visit('/');
        cy.get('body').should('be.visible');
    });
});

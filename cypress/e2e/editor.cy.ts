describe.skip('editor', () => {
  it('loads the page and allows the user to log in and select a date', () => {
    console.log(Cypress.env(), Cypress.env('THING'), "aesrea");
    const password = Cypress.env('AUTH_SECRET');
    cy.visit('http://localhost:3000/builder');
    cy.get('[data-testid="builder-password-input"]').type(password);
    cy.get('[data-testid="builder-password-input"]').type('{enter}');
    cy.get('[data-testid="game-day-picker"]', { timeout: 30000 }).should('exist');
    cy.get('.rdp-button_next').click();
    cy.get('.rdp-day_button').last().click();
    cy.get('[data-testid="card-display"]').should('exist');
  });
});
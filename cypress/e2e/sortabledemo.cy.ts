describe.only('sortabledemo', () => {
  it('loads the page', () => {
    cy.visit('http://localhost:3000/sortabledemo')
    cy.get('[data-testid="sortable-item"]').should('have.length.at.least', 2)


    cy.get('[data-testid="sortable-item"]').first()
    .trigger('pointerdown', {
        force: true,
        isPrimary: true,
        button: 0,
    })
    .wait(1000)
    .trigger('pointermove', {
        clientX: 400,
        clientY: 400,
        force: true,
        isPrimary: true,
        button: 0,
    })
    .wait(1000)
    .trigger('pointerup', {
        force: true,
        isPrimary: true,
        button: 0,
    });
  })
})
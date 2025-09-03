describe('front page', () => {
  it('loads the page', () => {
    cy.visit('http://localhost:3000')
    cy.get('[data-testid="submit-guess"]').should('exist').should('contain.text', 'Submit Guess')
  })

  it('allows the user to submit a guess', () => {
    cy.visit('http://localhost:3000')
    cy.get('[data-testid="submit-guess"]').should('exist').should('contain.text', 'Submit Guess')
    cy.get('[data-testid="overlay-frame"]').should('exist')
    cy.get('[data-testid="overlay-frame-close"]').should('exist')
    cy.get('[data-testid="overlay-frame-close"]').click()
    cy.get('[data-testid="overlay-frame"]').should('not.exist')
    cy.get('[data-testid="submit-guess"]').click()
    cy.get('[data-testid="guess-result"]').should('exist').should('have.length', 1)
  })
})

describe.skip('sample game page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/sample')
  });

  it('loads the page', () => {
    cy.get('[data-testid="submit-guess"]').should('exist').should('contain.text', 'Submit Guess');
  });

  it('allows the user to submit a guess', () => {
    cy.get('[data-testid="submit-guess"]').should('exist').should('contain.text', 'Submit Guess')
    cy.get('[data-testid="overlay-frame"]').should('exist')
    cy.get('[data-testid="overlay-frame-close"]').should('exist')
    cy.get('[data-testid="overlay-frame-close"]').eq(1).click()
    cy.get('[data-testid="overlay-frame-close"]').eq(0).click()
    cy.get('[data-testid="overlay-frame"]').should('not.exist')
    cy.get('[data-testid="submit-guess"]').click()
    cy.get('[data-testid="guess-result"]').should('exist').should('have.length', 1)
  });

  it('allows drag and drop', () => {
    cy.get('[data-testid="submit-guess"]').should('exist').should('contain.text', 'Submit Guess')
    cy.get('[data-testid="overlay-frame"]').should('exist')
    cy.get('[data-testid="overlay-frame-close"]').should('exist')
    cy.get('[data-testid="overlay-frame-close"]').eq(1).click()
    cy.get('[data-testid="overlay-frame-close"]').eq(0).click()
    cy.get('[data-testid="overlay-frame"]').should('not.exist')

    let position: { left: number, top: number };
    let size: { width: number, height: number };

    cy.get('[data-testid="sortable-card"]').eq(3).then((element) => {
      position = element.offset()!;
      size = { width: element.width()!, height: element.height()! };

      cy.get('[data-testid="sortable-card"]').eq(1)
      .trigger('pointerdown', {
          force: true,
          isPrimary: true,
          button: 0,
      })
      .wait(100)
      .trigger('pointermove', {
          clientX: position.left + size.width / 2,
          clientY: position.top + size.height / 2,
          force: true,
          isPrimary: true,
          button: 0,
      })
      .wait(100)
      .trigger('pointerup', {
          force: true,
          isPrimary: true,
          button: 0,
      });
    });
    cy.wait(0)
    cy.get('[data-testid="submit-guess"]').click()
    cy.get('[data-testid="guess-result"]').should('exist').should('have.length', 1)
    
  })
})
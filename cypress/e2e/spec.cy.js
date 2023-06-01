describe('template spec', () => {
  it('passes', () => {
    cy.visit('http://10.107.85.91:31349/AltoroJ_mvn')
    cy.get('#LoginLink').click()
    cy.get('#uid').type('jsmith')
    cy.get('#passw').type('demo1234')
    cy.get('input[name="btnSubmit"]').click()
    
    cy.get('#btnGetAccount').click()
  })
})
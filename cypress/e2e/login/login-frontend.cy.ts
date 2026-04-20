import { locators } from "@cypress/support/locators"

describe('Login', () => {

    const user = Cypress.env('SEU_BARRIGA_USERNAME')
    const email = Cypress.env('SEU_BARRIGA_EMAIL')
    const passwd = Cypress.env('SEU_BARRIGA_PASSWD')

    beforeEach(() => {
        cy.ensureSession(email, passwd, true)
        cy.stub_saldo()
    })

    it('Faz uma requisição de sucesso. Valida que o usuário conseguiu logar no sistema', () => {
        cy
            .realizar_login(email, passwd)
        cy
            .validar_dados_home_page()
        cy
            .get(locators.TOAST.MESSAGE).should('have.text', `Bem vindo, ${user}!`)
    })
})
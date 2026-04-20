import { locators as loc } from "@cypress/support/locators"

describe('Example', () => {

    const email = Cypress.env('SEU_BARRIGA_EMAIL')
    const passwd = Cypress.env('SEU_BARRIGA_PASSWD')

    beforeEach(() => {
        // cy.ensureSession(email, passwd, true)
        // cy.stub_saldo()
        cy.post_login(email, passwd)
    })

    it('Faz uma requisição de sucesso. Valida que o usuário conseguiu logar no sistema', () => {
        return
        cy
            .realizar_login(email, passwd)
        cy
            .xpath(loc.HOMEPAGE.XP_TXT_BEM_VINDO).should('be.visible').as('exibiuTextoBemVindo')
    })
})
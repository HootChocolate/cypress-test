import { locators as loc } from "../locators"

Cypress.Commands.add('validar_dados_home_page', () => {
    cy.get(loc.HOMEPAGE.ICON_HOME).should('be.visible').as('exibiuIconeHomePage')
    cy.get(loc.HOMEPAGE.ICON_EXTRATO).should('be.visible').as('exibiuIconeExtrato')
    cy.get(loc.HOMEPAGE.ICON_MOVIMENTACAO).should('be.visible').as('exibiuIconeMovimentacao')
    cy.get(loc.HOMEPAGE.ICON_CONFIG).should('be.visible').as('exibiuIconeConfiguracoes')
    cy.xpath(loc.HOMEPAGE.XP_TXT_BEM_VINDO).should('be.visible').as('exibiuTextoBemVindo')
})
import { fxAddress } from "@cypress/support/locators"
import { check_schema_validator, check_status_code } from "@cypress/utils/ApiUtils"
import { fakePerson } from "@cypress/utils/FakeUtils"

describe('Login', () => {

    const email = Cypress.env('SEU_BARRIGA_EMAIL')
    const passwd = Cypress.env('SEU_BARRIGA_PASSWD')

    it('Valida requisição de sucesso', () => {
        cy
            .fixture(fxAddress.LOGIN.SCHEMAS.SIGN_IN_SCHEMA).then(loginSchema => {
                cy
                    .post_login(email, passwd)
                    .then(response => {
                        const responseBody = response.body;
                        check_status_code(response.status, 200, "/signin")
                        check_schema_validator(responseBody, loginSchema, '/signin')
                    })
            })
    })

    it('Valida requisição de erro - Senha inválida', () => {
        cy
            .post_login(email, fakePerson.passwd, false)
            .then(response => {
                check_status_code(response.status, 401, "/signin")
                expect(`${response.statusText}`.toUpperCase(), "Deve bloquear acesso com senha inválida").to.be.eq("UNAUTHORIZED")
            })
    })
})
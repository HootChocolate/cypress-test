import { fxAddress } from "@cypress/support/locators"
import { check_schema_validator, check_status_code } from "@cypress/utils/ApiUtils"

describe('Login', () => {

    const email = Cypress.env('SEU_BARRIGA_EMAIL')
    const passwd = Cypress.env('SEU_BARRIGA_PASSWD')

    it('Check login', () => {
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
})
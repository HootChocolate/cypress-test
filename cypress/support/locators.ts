export const locators = {
    LOGIN: {
        INPUT_EMAIL: 'input[data-test="email"]',
        INPUT_PASSWD: 'input[data-test="passwd"]',
        BTN_ENTRAR: 'button[type="submit"]'
    },
    HOMEPAGE: {
        XP_TXT_BEM_VINDO: '//footer//*[contains(text(),"Nunca mais esqueça de pagar o aluguel")]'
    }
}

// aglutinador de endereços de fixtures
export const fxAddress = {
    CONTAS: {
        GET_SALDO: '/contas/saldo/getSaldo.json'
    }
}


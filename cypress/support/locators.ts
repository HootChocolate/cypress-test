export const locators = {
    TOAST: {
        MESSAGE: 'button[class="toast-close-button"] ~ div'
    },
    LOGIN: {
        INPUT_EMAIL: 'input[data-test="email"]',
        INPUT_PASSWD: 'input[data-test="passwd"]',
        BTN_ENTRAR: 'button[type="submit"]'
    },
    HOMEPAGE: {
        ICON_HOME: '[title="Home"]',
        ICON_MOVIMENTACAO: '[data-test="menu-movimentacao"] i',
        ICON_EXTRATO: '[data-test="menu-extrato"] i',
        ICON_CONFIG: 'i[title="settings"]',
        XP_TXT_BEM_VINDO: '//footer//*[contains(text(),"Nunca mais esqueça de pagar o aluguel")]'
    }
}

// aglutinador de endereços de fixtures
export const fxAddress = {
    CONTAS: {
        GET_SALDO: '/contas/saldo/getSaldo.json'
    },
    LOGIN: {
        SCHEMAS: {
            SIGN_IN_SCHEMA: '/login/schemas/sign_in_schem.json'
        }
    }
}


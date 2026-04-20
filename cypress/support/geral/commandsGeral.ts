import { isXPath } from "@cypress/utils/CommonUtils";



Cypress.Commands.add('valida_style',(locator: string, cssProperty: string, expectedValues: string[], expectedMessage?: string) => {

    const validate = ($el: JQuery<HTMLElement>) => {
      const el = $el.get(0);
      const styles = window.getComputedStyle(el);

      const value = styles.getPropertyValue(cssProperty);

      expect(
        expectedValues,
        expectedMessage || `Valor ${value} não está na lista esperada`
      ).to.include(value);
    };

    if (isXPath(locator)) {
      cy.xpath(locator).then(validate);
    } else {
      cy.get(locator).then(validate);
    }
  }
);

Cypress.Commands.add('valida_valor_monetario', (valor: string) => {
    const regexValorMonetario = /^R\$ \d{1,3}(\.\d{3})*,\d{2}$/;
    expect(valor).to.match(regexValorMonetario, `O valor "${valor}" não está no formato monetário esperado (ex: R$ 123,45).`);
});

Cypress.Commands.add('valida_campo_data', (data: string) => {
    const regexData = /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/;
    expect(data).to.match(regexData, `O valor "${data}" não está no formato de data esperado (ex: 11/09/2001 09:03).`);
});

Cypress.Commands.add('valida_lista_de_valores', (locator: string, expected_values: string[], appendMessageInit?: string) => {
    const opcoesExibidas: string[] = [];
    cy
        .get(locator) // Seleciona todos os textos
        .each((elements) => {
            const valorAtual = elements.text().toUpperCase();

            if (valorAtual != 'NENHUM') {
                opcoesExibidas.push(valorAtual)
            }
        })
        .then(() => {
            cy.wrap(expected_values).each((expected) => {
                let value = `${expected}`.toUpperCase();
                expect(opcoesExibidas).to.include(value, `${appendMessageInit ? appendMessageInit + ' - ' : ''}Valida lista de valores, o valor "${value}" é esperado no locator '${locator}'`);
            })
        }).as('validaListaDeValores');
});

Cypress.Commands.add('do_intercept', (intercepts: InterceptConfigInterface[]) => {
    return cy
        .wrap(intercepts)
        .each((cfg: InterceptConfigInterface) => {
            const { method, url, code = 200, alias, fixture, times } = cfg;

            if (!method || !url || !alias) {
                throw new Error('Intercept item is missing required properties: method, url and alias');
            }

            const routeMatcher: any = { method, url };
            if (typeof times === 'number') {
                routeMatcher.times = times;
            }

            cy.intercept(routeMatcher, { statusCode: code, fixture }).as(alias);
        });
});

Cypress.Commands.add('wait_intercept', (aliases: string[], expectedCode = 200) => {
    if (!aliases || aliases.length === 0) {
        throw new Error("Lista de alias passada para a função wait_intercept vazia");
    }

    // Aguarda todos de uma vez só
    return cy.wait(aliases.map(a => `@${a}`), { timeout: 10000 }).then((interceptions) => {
        // força um array
        const arr = Array.isArray(interceptions) ? interceptions : [interceptions];

        arr.forEach((interception, idx) => {
            const alias = aliases[idx];
            cy.wrap(interception)
                .its('response.statusCode')
                .should('eq', expectedCode, `Status code para ${alias}`)
                .as(`code_${alias}`);
        });
    });
});

Cypress.Commands.add('url_must_be', (url_before: string, alias?: string) => {
    cy
        .url()
        .then(url_after => {
            expect(url_after, 'Valida que a url anterior continua a mesma').to.be.equals(url_before)
        })
        .as(`${alias ? alias : 'url_must_be'}`)
})
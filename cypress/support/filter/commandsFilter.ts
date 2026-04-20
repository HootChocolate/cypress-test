import { check_status_code } from "cypress/utils/ApiUtils";
import { isNullOrEmpty } from "cypress/utils/CommonUtils";

Cypress.Commands.add('testar_request_com_opcoes_de_filtros', (
    funcao: (qs: Record<any, any>) => Cypress.Chainable<any>,
    qs: Record<any, any>,
    chaves_filtros?: string[],
    quick_filters?: Record<any, string[] | Record<any, string[]> | Record<"quickFilter", Record<string, Record<"query" | "operator", any>>>>
) => {

    const responseAssertGeneric = 'GET Teste de filtro genérico. Filtrando por campo [#{campo}] e valor [#{valor}]';

    // mapa para controlar execução por campo
    const chaves_filtros_par_boolean = Object.fromEntries(chaves_filtros ? chaves_filtros.map((chave) => [chave, false]) : []);

    function checkResponseData(campo: string, returned: string, expected: string) {
        if (returned) { // não faz o assert quando não existe dado na informação retornada pela request
            expect(returned, responseAssertGeneric.replace('#{campo}', `${campo}`).replace('#{valor}', `${expected}`)).to.eq(expected);
        }
    }

    function testaFiltro(campo, valor, jaTestado, isQuickFilter) {
        const nomeDaFuncao = `${funcao}`

        if (isNullOrEmpty(valor)) return cy.wrap(null);

        if (jaTestado) return cy.wrap(null);

        let filterPayload: Record<any, any> = { page: 1, size: 15 };

        cy.log(`Filtrando pelo campo ${campo} e valor ${valor}`);

        if (isQuickFilter) {
            filterPayload = { ...filterPayload, [campo]: valor };
        } else {
            filterPayload = { ...filterPayload, filter: [`${campo},eq,${valor}`] };
        }

        if (!isNullOrEmpty(qs)) {
            filterPayload = { ...qs, ...filterPayload };
        }

        return funcao(filterPayload).then((response) => {
            const msg = `STATUS_CODE - ${responseAssertGeneric.replace('#{campo}', `${campo}`).replace('#{valor}', valor)}`;

            check_status_code(response.status, 200, msg);
            return response.body;
        });
    }

    function testarChavesFiltros(responseBody) {
        if (!chaves_filtros) return cy.wrap(null);

        const object_to_filter = responseBody.data?.[0];
        if (isNullOrEmpty(object_to_filter)) return cy.wrap(null);

        return Cypress._.chain(chaves_filtros)  // fluxo encadeado, dependente - melhor usar o chain que o cy.wrap().each() - executa sequencial
            .map((chave) => () => {
                let valor = object_to_filter[chave];
                const jaTestado = chaves_filtros_par_boolean[chave];

                if (!valor) { // fallback
                    valor = Cypress._.get(object_to_filter, chave);
                }

                return testaFiltro(chave, valor, jaTestado, false)
                    .then((responseDataFilter) => {
                        if (!isNullOrEmpty(responseDataFilter) && !jaTestado) {
                            chaves_filtros_par_boolean[chave] = true;
                            checkResponseData(chave, responseDataFilter.data[0][chave], valor);
                        }
                    }
                    );
            })
            .thru((fns) => fns.reduce((p, fn) => p.then(fn), cy.wrap(null)))
            .value();
            /**
             * thru():
             * Ele transforma um array de funções (fns) em uma execução sequencial encadeada no Cypress.
             * Quebrando em um array de funções, exemplo:
             * 
             * [
             *  () => cy.log('A'),
             *  () => cy.log('B'),
             *  () => cy.log('C')
             * ]
             * 
             * Com o reduce, ele cria uma cadeia do tipo:
             * cy.wrap(null)
             *   .then(() => fn1())
             *   .then(() => fn2())
             *   .then(() => fn3())
             */
    }

    function testarQuickFilters() {
        if (!quick_filters) return cy.wrap("Sem quick_filter para teste");

        const filtros = JSON.stringify(quick_filters);
        const boolMap: Record<string, boolean> = {}; // controle de execução única

        if (filtros.includes('"quickFilter":')) {

            const quickFilter: Record<string, Record<string, string>> = {};
            const quickFilterBool: Record<string, boolean> = {};

            // Constrói os objetos de filtros e inicializa booleanos
            Object.entries(quick_filters).forEach(([_, filterObj]) => {
                Object.entries(filterObj).forEach(([chave, valores]) => {
                    const valor = valores.query;
                    const operador = valores.operator;

                    quickFilter[chave] = { [operador]: valor };
                    quickFilterBool[chave] = false;
                });
            });

            const entries = Object.entries(quickFilterBool);

            // Encadeia as execuções de testes de forma assíncrona
            return entries.reduce((chain, [chave]) => {
                const operador = Object.keys(quickFilter[chave])[0];
                const valor = quickFilter[chave][operador];
                const jaTestado = quickFilterBool[chave];

                return chain.then(() => {
                    return testaFiltro(chave, valor, jaTestado, true).then(response => {
                        if (!isNullOrEmpty(response.data)) {
                            checkResponseData(chave, response.data[0][chave], valor);
                            boolMap[`${chave}_${valor}`] = true;
                        } else {
                            cy.log('Sem dados para validar informação retornada');
                        }
                    });
                });
            }, cy.wrap(null));

        } else {

            const quick_values = Object.entries(quick_filters as Record<string, string[]>).flatMap(([chave, valores]) =>
                valores.map(valorObj => ({ chave, valor: valorObj }))
            );

            // Inicializa o controle de execução
            quick_values.forEach(({ chave, valor }) => (boolMap[`${chave}_${valor}`] = false));

            // Encadeia execução assíncrona para cada filtro
            return quick_values.reduce((chain, { chave, valor }) => {
                const jaTestado = boolMap[`${chave}_${valor}`];

                return chain.then(() => {
                    return testaFiltro(chave, valor, jaTestado, true).then(responseDataQuickFilter => {
                        if (!isNullOrEmpty(responseDataQuickFilter.data)) {
                            checkResponseData(chave, responseDataQuickFilter.data[0][chave], valor);
                            boolMap[`${chave}_${valor}`] = true;
                        } else {
                            cy.log('Sem dados para validar informação retornada');
                        }
                    });
                });
            }, cy.wrap(null));
        }
    }

    // fluxo principal
    return funcao(qs).then((response) => {
        const responseBody = response.body;
        if (!responseBody) {
            throw new Error('A função passada deve retornar a response da request com body, utilizado na construção de outro payload');
        }

        return testarChavesFiltros(responseBody).then(() => {
            testarQuickFilters();
        });
    });
});
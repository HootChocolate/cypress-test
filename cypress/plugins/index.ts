/**
 * Adicione aqui os Commands, após adicionar no arquivo commands.ts = Necessário por conta do TypesCript
 * 
 * Considere separar os comandos agrupado por tela, funcionalidade ou algo que agrupe
 */
declare namespace Cypress {
  interface Chainable {
    data_qa(data_qa_selector: string): Chainable<JQuery<HTMLElement>>,
    /**
     * Utilizado para deixar coisas anotadas durante os testes, as vezes uma indefinição de regra de negócio, coisas que talvez seja útil ser lembrado,
     * 
     * Enviará em um grupo de alternative logs do Telegram
     * @param message 
     */
    warn(message: string): Chainable<JQuery<HTMLElement>>,
    info(message: string): Chainable<JQuery<HTMLElement>>,
    skip(message: string): Chainable<JQuery<HTMLElement>>,
    doc(message: string): Chainable<JQuery<HTMLElement>>,
    exist_element(locator: string): Chainable<boolean>,
    /**
     * Valida status code;   
     * Status code default 200.
     * @param statusRetornado 
     * @param statusEsperado 
     */
    check_salvo_com_sucesso(response: object, overrideMsg?: string): Chainable<JQuery<HTMLElement>>,
    check_removido_com_sucesso(response: object, overrideMsg?: string): Chainable<JQuery<HTMLElement>>,

    post_login(email: string, passwd: string): Chainable,
    stub_login_ensure_session(fixtureTmp: string): Chainable,
    stub_saldo(): Chainable
    realizar_login(email: string, passwd: string): Chainable<JQuery<HTMLElement>>,
    ensureSession(email: string, passwd: string, frontend: boolean, overrideVisitURL?: string): Chainable,

    url_must_be(url_before: string, alias?: string): Chainable<JQuery<HTMLElement>>,
    valida_style(locator: string, cssProperty: string, expectedValues: string[], expectedMessage?: string): Chainable<JQuery<HTMLElement>>,

    valida_valor_monetario(valor: string): Chainable<JQuery<HTMLElement>>,
    valida_campo_data(data: string): Chainable<JQuery<HTMLElement>>,
    
    validar_dados_home_page(): Chainable<JQuery<HTMLElement>>,
    /**
     * Encontra todos os textos à partir do locator, e compara com as opções passada
     * validando que no locator passado, existem as opções
     * @param locator: string
     * @param expected_values: string[] 
     */
    valida_lista_de_valores(locator: string, expected_values: string[], appendMessageInit?: string): Chainable<JQuery<HTMLElement>>,
    /**
     * Comando utilizado para fazer múltiplos intecepts, com base na interface criada para o intercept
     *
     * Permite definir uma lista de interceptações (requests) que serão mockadas pelo Cypress, ao chamar a API, será retornado o valor do mock
     *
     * @example
     * // Exemplo de uso em um teste
     * 
     * 
     * const intercepts: InterceptConfigInterface[] = [
     *   {
     *     method: 'GET',
     *     url: '${Cypress.env("BASE_URL_API")}/listar_algo',
     *     alias: 'aliasToWaitIntercept',
     *     fixture: 'fxAddress.PATH.TO.FIXTURE.FILE.MOCK, // opcional
     *     code: 201 // default 200
     *   },
     *   {...}
     *  ];
     * 
     * return cy.do_intercept(interpects);
     *
     * Só faz o intercept, não aguarda no wait()
     *
     * @param {InterceptConfigInterface[]} intercepts - interface dos intercepts
     *
     * @typedef {Object} InterceptConfigInterface
     * @property {'GET' | 'POST' | 'PUT' | 'DELETE' | string} method - Método HTTP da request
     * @property {string | RegExp} url - URL (ou regex) da requisição a ser interceptada
     * @property {string} alias - Nome usado para referenciar a interceptação via cy.wait_intercept()
     * @property {number} [code=200] - Status code. Default 200
     * @property {string} [fixture] - opcional
     * @property {number} [times] - Número de vezes que a interceptação deve responder (ex.: `times: 1`).
     */
    do_intercept(intercepts: InterceptConfigInterface[]): Chainable;
    /**
     * Pega o alias e aguarda que o status do stub seja satisfeito.   
     * Deve ser adicionado após ação de intercept.
     * 
     * cy.wait() de intercepts. 
     * 
     * @param alias lista de aliases
     * @param code default 200
     * @return promise
     */
    wait_intercept(alias: string[], code?: number): Chainable,

    // Commands para requisições API
    /**
     * Quando não existir um token faz a request;   
     * Token armazenado em variáveis em tempo de execução, no objeto customEnv
     * Retorna o token gerado/armazenado
     */
    ensureToken(email: string, passwd: string): Chainable<any>,
    /**
     * A função funcionará da seguinte maneira:
     * Será feito uma request inicial, para pegar os dados para filtragem posterior;
     * Depois será iterado sobre as opções de filtros, filtrando por cada uma das opções, e validando o retorno, se é o mesmo que foi enviado (pega a informação da request inicial);
     * Como o filtro utilizará para requisição o dado retornado pela request inicial, é esperado que o filtro retorne a informação (se o request inicial retornou uma conta com o código 123, o filtro por código 123 deve retornar a conta de código 123)
     * @param funcao (qs) => cy.get_funcao(qs)
     * @param qs  query string
     * @param chaves_filtros  [ string ] 
     * @param quick_filters  { chave_filtro: [ string ]} - Dos filtros rápidos
     */
    testar_request_com_opcoes_de_filtros(funcao: (payload: Record<any, any>) => Cypress.Chainable<any>, original_payload: Record<any, any>, chaves_filtros?: string[], quick_filters?: Record<any, string[]> | Record<any, string[]> | Record<"quickFilter", Record<string, Record<"query" | "operator", any>>>): Chainable,

  }
}

// Configuração de tipos para os intercepts
/**
 * Interface para criação de lista de intercept 
 * StatusCode padrão é 200
 */
interface InterceptConfigInterface {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  alias: string;
  fixture?: string;
  code?: number;
  times?: number;
}
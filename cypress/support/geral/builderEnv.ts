// classe com funções destinadas a utilização na contrução do ambiente de teste

import { isNullOrEmpty, sanitizeFileName } from "@cypress/utils/CommonUtils";

/**
 * Garante a criação de arquivos em uma fixture após na requisição inicial.
 * 
 * Procura na pasta tmp/login por uma fixture de login do usuário, 
 * caso não exista o arquivo (a primeira execução não vai existir) ele cria, se existir 
 * ele usa essa fixture como mock.
 * 
 * O arquivo tem um hash diario no padrão login_${username}_hash[yyyyMMdd].json
 * 
 * Foi feito dessa maneira porque eu preferi fazer uma request para pegar os dados do usuário, 
 * que usar um mock, visto que as vezes algum teste falha por conta de permissão. Ao realizar o login, 
 * as permissões para o usuário são retornadas
 * @param username 
 * @param isFrontend 
 */
function ensure_user_login_tmp_file(username: string, passWd: string, isFrontend: boolean) {
    console.log(`chamou a function ensure_user_login_tmp_file para o ${username}`);
    cy
        .task('existFixtureFile', fixtureUserLoginHashPattern(username))
        .then(existsDailyUserFile => {
            if (!existsDailyUserFile) { // cria fixture do login
                cy
                    .post_login(username, passWd)
                    .then(response => {
                        cy.info(`Cria fixture de login para o usuário ${username}`);
                        cy.warn(`Cria fixture de login para o usuário ${username}`);

                        if (!isFrontend) { // para teste do back é necessário exportar o token pra geral 
                            Cypress.env("accessToken", response.accessToken)
                        }

                        cy.task('writeFixture', { filePath: fixtureUserLoginHashPattern(username), data: response });

                        cy.stub_login_ensure_session(fixtureUserLoginHashPattern(username))
                    })
            } else {
                // utiliza fixture existente
                if (isFrontend) {
                    cy.info(`Utiliza fixture de login do usuário ${username}`);
                    cy.warn(`Utiliza fixture de login do usuário ${username}`);

                    cy
                        .fixture(fixtureUserLoginHashPattern(username))
                        .then(responseFixtureLogin => {
                            const accessToken = responseFixtureLogin.accessToken;

                            cy.then(() => {
                                window.localStorage.setItem('accessToken', accessToken);
                            });


                            cy.stub_login_ensure_session(fixtureUserLoginHashPattern(username))
                        })

                } else {
                    // TODO
                    // Cypress.env("accessToken", fixtureUserLoginHashPattern(username).accessToken)
                }
            }
        })
};

/**
 * 
 * @returns código diario utilizado como identificador
 */
function dailyCode() {
    const now = new Date();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;

}
/**
 * Padrão do nome da pasta de fixture de login por usuário
 * @param username 
 */
function fixtureUserLoginHashPattern(username: string) {
    const tmpLoginFolder = 'geral/tmp/login'
    const auxUsername = sanitizeFileName(username)
    const fileUserHash = `login_${auxUsername}_hash[${dailyCode()}].json`;
    return `${tmpLoginFolder}/${fileUserHash}`;
}

// existem outras maneiras de definir como utilizar um sessionId para a sessão, caso necessário alterar:
// https://docs.cypress.io/api/commands/session#Choosing-the-correct-id-to-cache-a-session
/**
 * Garante um cache de sessão para frontend ou backend.   
 * Quando não existir um cache de sessão para o usuário, será criado. Quando existir, será utilizado.   
 * Algumas vezes ele é atualizado.   
 * Seta o accessToken no localStorage.
 * 
 * Você não pode modificar uma sessão armazenada depois que ela foi colocada em cache, 
 * mas sempre pode criar uma nova sessão com um ID diferente.
 * 
 * ATENÇÃO: Caso necessário chamar o cy.visit() mais de uma vez numa bateria de teste, adicionar no beforeEach, chamando o ensureSession() novamente
 * 
 * @param username 
 * @param frontend 
 * @param overrideVisitURL - optional. Se informado, salva a sessão de acesso a URL. frontend precisa ser true
 * @returns promisse
 */
Cypress.Commands.add('ensureSession', (email: string, passwd: string, frontend: boolean, overrideVisitURL?: string) => {

    if (!email || !passwd) {
        throw new Error(`Required values must be provided [email: ${passwd}, passwd: ${passwd}]`)
    }
    if (frontend && !overrideVisitURL) { // se não sobrescrever a url do visit
        buildEnv(email, passwd, frontend)
    }

    // é possível modificar os dados da sessão, como remover cookie e adicionar outros
    const typeLogin = `${frontend ? 'loginByForm' : 'loginByAPI'}`;
    const fileName = Cypress.spec.name;
    const aux = email.replace('@', '_')
    

    const sessionId = {
        user: aux,
        loginType: typeLogin,
        visit: overrideVisitURL || '/',
        frontend
    };

    return cy.session(sessionId, () => {
        if (!overrideVisitURL) { // não sobrescrever visit
            if (frontend) {
                cy.realizar_login(email, passwd);
            } else {
                cy.post_login(email, passwd).then((response) => {
                    const accessToken = response.accessToken;
                    expect(accessToken, "GET accessToken").to.be.not.null
                    window.localStorage.setItem('accessToken', accessToken)
                    Cypress.env('accessToken', accessToken)
                });
            }
        } else { // sobrescreve visit de login
            cy.visit(overrideVisitURL)
        }
    }, {
        // garante que a sessão tenha sido criado corretamente
        // útil quando o cache da sessão está sendo restaurado, se a sessão não é válida o cy.session() recria a sessão
        validate() {
            if (frontend) {
                if (!overrideVisitURL) { // não sobrescreveu o visit
                    cy.visit('/') // TODO: Adicionar uma validação para a aplicação quando for utilizar
                } else {
                    cy.visit(overrideVisitURL)
                }
            } else {
                // faz uma requisição qualquer para a API, para validar backend
                throw new Error('TODO: Defina uma requisição para o validate do ensureSession()')
            }
        },
        cacheAcrossSpecs: true, // usar a mesma sessão pelos specs it()
    })
})

Cypress.Commands.add('ensureToken', (email: string, passwd: string) => {

    // console.log(`${isNullOrEmpty(Cypress.env("accessToken")) ? "Token null" : "Token preenchido\n" + Cypress.env("accessToken")}`);


    if (isNullOrEmpty(Cypress.env("accessToken"))) {
        cy.post_login(email, passwd)
            .then(response => {
                Cypress.env("accessToken", response.accessToken);
            })
    }

    if (false) {    // salva uma fixture do login, garantee o accessToken nas variáveis
        if (isNullOrEmpty(Cypress.env("accessToken"))) {
            const aux = email.replace("@", "_")

            const fileUserHash = `login_${aux}_hash[`;
            const tmpLoginFolder = 'geral/tmp/login'
            const prefixFixtureLogin = `${tmpLoginFolder}/${fileUserHash}`;


            cy
                .task('existFixtureFile', prefixFixtureLogin).then(existsUserFile => {
                    if (!existsUserFile) {
                        cy.log(`ensureToken to user: ${email}`);
                        cy.post_login(email, passwd)
                            .then(response => {
                                Cypress.env("accessToken", response.accessToken);
                            })
                    } else {
                        cy
                            .fixture(prefixFixtureLogin)
                            .then((fixLogin) => {
                                // pega o accessToken da fixture tmp
                                Cypress.env("accessToken", fixLogin.accessToken);
                            })
                    }
                })
        }
    }
});

export function buildEnv(username: string, passWd: string, isFrontend: boolean) {
    // intercepts comum a todo o sistema
    // const intercepts: InterceptConfigInterface[] = [
    //     {
    //         method: 'GET',
    //         url: `${Cypress.env('BASE_URL_API')}`,
    //         alias: '',
    //         fixture: '',
    //     }
    // ];
    // cy.do_intercept(intercepts);

    if (username) {
        // cria ou utiliza response do arquivo de login para o usuário
        ensure_user_login_tmp_file(username, passWd, isFrontend)
    }

};
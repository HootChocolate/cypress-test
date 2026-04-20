Pré-requisitos:
- git
- node
- cypress
- editor de código (VS Code)

Instalação:
- Clone o projeto;
- npm install --force
- arquivo .env

Execução:


Sugestão:
- Instale o pacote node task lisk para facilitar a execução
sudo npm install -g ntl

### Pastas:   
- fixtures: Os fixtures são arquivos com dados que são utilizados pelos testes;   
- plugins: Plugins do Cypress usados para estender as funcionalidades da ferramenta;   
- suporte: Arquivos de configurações e funções auxiliares.   

📦 seu-projeto/
 ┣ 📂 cypress/
 ┃ ┣ 📂 results/
 ┃ ┃ ┗ 📂 doc/
 ┃ ┃    ┣ api-doc.json
 ┃ ┃    ┗ (aqui vai sair o api-doc.md ou swagger.json)
 ┣ 📂 scripts/
 ┃ ┗ generate-doc.ts
 ┣ package.json
 ┗ tsconfig.json



# Paralelismo
https://testgrid.io/blog/cypress-parallel-testing/

# Logger - Debugging API:
https://medium.com/@Hariprasath_V_S/supercharge-your-cypress-tests-with-cypress-api-logger-274d55d67d52

# Rodar no cloud:
npx cypress run --record --key RECORD_KEY

# Schema Validation:
Exemplo de schema para validação
`json
{
  "openapi": "3.0.0",
  "info": {
    "title": "JSONPlaceholder API",
    "description": "Schema definition for the /endpoint",
    "version": "1.0.0"
  },
  "paths": {
    "/endpoint": {
      "get": {
        "summary": "Get",
        "description": "some description",
        "responses": {
          "200": {
            "description": "A successful response",
            "schema": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": { },
                "required": [ ]
              }
            }
          }
        }
      }
    }
  }
}
`

Exemplo de uso em código:
`javascript
    cy
      .fixture('schema.json')
      .then((schema) => {
        cy
          .api({})
          .then(response => {
            cy.wrap(response.body.data).as('responseBody');

            cy
              .get('@responseBody')
              .then((responseBody) => {
                
                const expected = schema.paths["/endpoint"].get.responses["200"].content["application/json"].schema;

                schema_validator(expected, responseBody)
              });
          })
      });
`


##### Pasta temp:
Para que ao realizar 99 teste não seja realizado 99 requisições de login, sendo necessário existir um acessToken atualizado em cada requisição, ao realizar a requisição para login:
- Verificará se existe na fixture tmp/ um registro de login para o usuário;
- Se não existir, cria um arquivo com login_${usuario}_hash[${hash}].json


##### Criar novo teste de API:
Estrutura inicial do teste de API:
`
const usr = Cypress.env("USERNAME");

describe('Aglutinador de teste de API', () => {

    beforeEach(() => {
        cy.ensureSession(usr, false)
    })

    it('do something', () => {
        cy
            .fixture('schemas.json')
            .then(fixtureSchemas => b{
                // const schema = fixtureSchemas.paths["/recover"].get.responses["200"].schema;
                // schema_validator(schema, responseData)
            })
    });
});
`

##### Teste de API - Documentação:
Adicione commands criado, as anotações para gerar a documentação:
`
Cypress.Commands.add('', () => {
  const path = '/'; // onde será salvo
	const method = "";
	const url = `/`;
	const headers = {
		"X-Path": `${Cypress.env("MENU_")}`,
		"Content-Type": "application/json",
		"Authorization": `Bearer ${Cypress.env("accessToken")}`
	}
  const queryString = { }
  const body = { }
  const filtrosAvancados = [ "" ];
  const filtroRapidos = [ "" ];

	cy.task("saveApiDocs", {
		path: '',
		method: method,
		url: url,
		headers: headers,
		body: body
    queryString: queryString, // que é passado após "?" na url
    filtrosAvancados: filtrosAvancados, // crie uma function que retorne o array de chaves para os filtros
    filtroRapidos: filtroRapidos  // // crie uma function que retorne o array de chaves para os filtros
	});

	return cy.api({
		method: method,
		url: `${Cypress.env("BASE_URL_API")}${url}`,
		body: body,
		headers: headers
	})
		.then(response => {
      // se for utilizar no teste que filtra todas as opções de filtros, não deve retornar o response.body
			return response
		})
})
`

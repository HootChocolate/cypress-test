### Pré-requisitos:   
Antes de iniciar, certifique-se de ter instalado:

- Git
- Node.js (recomendado: v18+)
- Cypress
- Editor de código (ex: VS Code)

### Instalação:   
`
  git clone <repo-url>
  cd <repo>
  npm install
`

### Execução:   
Para abrir o cypress e executar:   
`npx cypress open`   
Ou modo headless:   
`npx cypress run`

### Sugestão:
- Instale o pacote node task lisk para facilitar a execução:   
`npm install -g ntl`

### Pasta temp:
Para evitar múltiplos logins:   

- Verifica se existe token em fixtures/tmp/
- Caso não exista → cria arquivo:   
`login_${usuario}_hash[${hash}].json`

### Extrutura de pastas:   
- fixtures: Os fixtures são arquivos com dados que são utilizados pelos testes;   
- plugins: Plugins do Cypress usados para estender as funcionalidades da ferramenta;   
- suporte: Arquivos de configurações e funções auxiliares.   
```
📦 projeto/   
 ┣ 📂 cypress/   
 ┃ ┣ 📂 fixtures/      # Dados mockados para testes   
 ┃ ┃ ┗ 📂 geral/   
 ┃ ┃ ┃ ┗ 📂 tmp/   
 ┃ ┣ 📂 results/   
 ┃ ┃ ┗ 📂 doc/   
 ┃ ┃    ┣ api-doc.json # Gera json quando roda o teste no cypress
 ┃ ┃    ┗ api-doc.md   # Transforma o arquivo .json em um arquivo markdown - quando roda o sript generate   
 ┃ ┣ 📂 support/       # Commands e configs   
 ┃ ┗ 📂 e2e/           # Testes   
 ┣ 📂 scripts/   
 ┃ ┗ generate-doc.ts   # Script que gera documentação   
 ┣ package.json   
 ┗ tsconfig.json   
```


###  Paralelismo
Referência:   
https://testgrid.io/blog/cypress-parallel-testing/

###  Debug de API:
https://medium.com/@Hariprasath_V_S/supercharge-your-cypress-tests-with-cypress-api-logger-274d55d67d52

###  Execução no Cypress Cloud:   
`npx cypress run --record --key RECORD_KEY`

###  Schema Validation:
Exemplo de schema para validação
```
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
```

### Criar novo teste de API:
Estrutura inicial do teste de API:
```
const usr = Cypress.env("USERNAME");
const email = Cypress.env("EMAIL");
const passwd = Cypress.env("PASSWD");

describe('Aglutinador de teste de API', () => {

    beforeEach(() => {
        cy.ensureSession(usr, email, passwd, false)
    })

    it('do something', () => {
      cy
        .fixture(fxAddress.PATH_TO_SCHEMA_ADDRESS)
        .then((schema) => {
          cy
            .do_something_commands()
            .then(response => {
              const responseBody = response.body;

              check_status_code(response.status, 200, "/endpoint")
              check_schema_validator(responseBody, schema, '/endpoint')
            })
        });
    });
});
```

### Teste de API - Documentação:
Caso necessário gerar uma documentação para o teste de API, isso pode ser feito   
com a task _saveApiDocs_.   
Basta adicionar as informações que são necessárias para a documentação do endpoint específico.   
Ao rodar o teste de API, salvará a documentação na pasta /doc.
O processo de publicação das documentações, acontece na pipeline:   

```
Cypress.Commands.add("do_something", () => {   
  const path = "/path/to/save/doc";   
	const method = "GET";   
	const url = "/endpoint";   
	const headers = {   
		"Content-Type": "application/json",   
		"Authorization": "Bearer ${Cypress.env("accessToken")}"   
	}   

  const queryString = {
    "size": 10,
    "page": 1
  }   
  const body = {
    "foo": "bar"
  }   
   
	cy.task("saveApiDocs", {   
		path: path,   
		method: method,   
		url: url,   
		headers: headers,   
		body: body   
    queryString: queryString, // que é passado após "?" na url   
	});   
   
	return cy.api({   
		method: method,   
		url: '${Cypress.env("BASE_URL_API")}${url}',   
		body: body,   
		headers: headers,
    qs: queryString 
	})
})   
```

import { fxAddress, locators as loc } from "@cypress/support/locators"

Cypress.Commands.add('stub_login_ensure_session', (fixtureTmp: string) => {

	const intercepts: InterceptConfigInterface[] = [
		{
			method: 'POST',
			url: `${Cypress.env('BASE_URL')}/signin`,
			alias: 'doLogin',
			fixture: fixtureTmp,
		},
	];

	return cy.do_intercept(intercepts);
})

Cypress.Commands.add('post_login', (email: string, password: string, failOnStatusCode?: boolean) => {
	const method = "POST";
	const url = `/signin`;
	const headers = {
		"Content-Type": "application/json"
	}
	const body = { 
		email: `${email}`, 
		senha: `${password}`, 
		redirecionar: false
	}

	const bodySaveDoc = {
		email: email, 
		senha: '********', 
		redirecionar: false
	}

	cy.task("saveApiDocs", {
		path: '/login',
		method: method,
		url: url,
		headers: headers,
		body: bodySaveDoc
	})

	return cy.api({
		method: method,
		url: `${Cypress.env("BASE_URL_API")}${url}`,
		body: body,
		failOnStatusCode: failOnStatusCode != undefined ? failOnStatusCode : true,
		headers: headers
	})
})

Cypress.Commands.add('realizar_login', (email: string, passwd: string) => {

	const inicio = Date.now();
	const limite = 180000;

	cy
		.visit('/', {
			timeout: limite
		})
		.then((logsVisit) => {
			cy.get(loc.LOGIN.INPUT_EMAIL).type(email).as('digitaEmail');
			cy.get(loc.LOGIN.INPUT_PASSWD).type(passwd).as('digitaSenha')
			cy.get(loc.LOGIN.BTN_ENTRAR).click().as('clickBtnEntrar')			
		})
		.then(() => {

			const fim = Date.now();
			const duracao = fim - inicio; // ms

			const totalSegundos = Math.floor(duracao / 1000);
			const minutos = Math.floor(totalSegundos / 60);
			const segundos = totalSegundos % 60;

			// mm:ss
			const formattedDuration = `${minutos.toString().padStart(2, "0")}:${segundos
				.toString()
				.padStart(2, "0")}`;

			// console.log(`Login ${email} - Tempo total de login: ${formattedDuration}`);
		})
});

Cypress.Commands.add('stub_saldo', () => {
  const intercepts: InterceptConfigInterface[] = [
    {
      method: 'GET',
      url: `${Cypress.env('BASE_URL_API')}/saldo`,
      alias: 'getSaldo',
      fixture: fxAddress.CONTAS.GET_SALDO,
    }
  ]

  return cy.do_intercept(intercepts)
})
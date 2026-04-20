/// <reference types="cypress" />

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
import './login/commandsLogin';
import './home/commandsHome'

import './geral/commandsGeral';
import './geral/builderEnv'
import { isXPath, nvl } from '@cypress/utils/CommonUtils';


Cypress.Commands.add('data_qa', (data_qa_selector: string) => {
  return cy.get(`[data-qa-selector=${data_qa_selector}]`)
})

Cypress.Commands.add('warn', (message: string) => {
  
  const tmpFile = 'geral/tmp/monitoramento/warns.json'

  cy
    .task('existFixtureFile', tmpFile)
    .then(existTmpFile => {

      if (!existTmpFile) {
        console.log('criando arquivo warns');
        
        // primeira escrita
        const fixtureDataValues = {
          data: [message]
        };

        cy.task('writeFixture', { filePath: tmpFile, data: fixtureDataValues });
      } else {
        // ler o conteúdo do arquivo existente
        cy
          .readFile(`cypress/fixtures/${tmpFile}`)
          .then(existingData => {
            const fixtureBody = existingData || { data: [] };

            // adiciona o novo valor ao array
            fixtureBody.data.push(message);

            cy.task('writeFixture', { filePath: tmpFile, data: fixtureBody });
          });
      }
    });
})

Cypress.Commands.add('skip', (message: string) => {
  cy.log(`⚫ ${message}`);
})

Cypress.Commands.add('info', (message: string) => {
  // 🟡 🔴 🟢
  cy.log(`🔵 ${message}`);
})

Cypress.Commands.add('doc', (txt: string) => {
  console.log(`📚 [DOC] ${txt}`);
})

/**
 * Aceita back e front
 */
Cypress.Commands.add('check_salvo_com_sucesso', (response: object, overrideMsg?: string) => {
  const isObject = `${response}`;

  if (isObject.toUpperCase() === '[object Object]') { // front

    cy.wrap(response).its('message').should('eq', nvl(overrideMsg, 'Salvo com sucesso'))

  } else {  // back
    expect(response, nvl(overrideMsg, 'Salvo com sucesso')).to.equal('Salvo com sucesso')
  }
})

Cypress.Commands.add('check_removido_com_sucesso', (response: object, overrideMsg?: string) => {
  const isObject = `${response}`;

  if (isObject.toUpperCase() === '[object Object]') { // front

    cy.wrap(response).its('message').should('eq', nvl(overrideMsg, 'Removido com sucesso!'))

  } else {  // back
    expect(response, nvl(overrideMsg, 'Removido com sucesso')).to.equal('Removido com sucesso!')
  }
})

Cypress.Commands.add('exist_element', (locator) => {
  if (isXPath(locator)) {
    return cy
      .document()
      .then((doc) => {
        const element = doc.evaluate(
          locator,
          doc,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue;

        return element != null
      })
  } else {
    return cy.document().then((doc) => {
      return doc.querySelector(locator) != null;
    });
  }
})

// Sobrescreve o comando visit apenas pegar dados de porformance de máquina
Cypress.Commands.overwrite('visit', (originalFn, ...args: Parameters<typeof cy.visit>) => {
  cy.task('getOSInfo').then((osInfo: any) => {
    const start = Date.now();
    const logsVisit: string[] = [];

    // Se disponível, registra a quantidade de núcleos e o modelo da primeira CPU
      const cpus = osInfo.cpus;
    if (cpus && cpus.length > 0) {
      logsVisit.push(
        `Ambiente: CPUs=${cpus.length}, Modelo=${cpus[0].model}`
      );
    } else {
      logsVisit.push(`Ambiente: CPUs indisponível (container restrito)`);
    }

    // Calcula e registra a memória total disponível em GB conforme a Plataforma sendo executada
    logsVisit.push(
      `Plataforma=${osInfo.platform} ${osInfo.arch}, MemTotal=${(
        osInfo.totalmem /
        1024 ** 3
      ).toFixed(2)}GB`
    );


    // pode distorcer medições próximas (especialmente em CI/CD)
    // Em ambiente de pipeline (Azure, Docker, etc.), isso pode variar bastante.
    const benchStart = performance.now();
    let sum = 0;
    for (let i = 0; i < 1e7; i++) {
      sum += i;
    }
    const benchEnd = performance.now();
    logsVisit.push(
      `Benchmark CPU (loop 1e7): ${(benchEnd - benchStart).toFixed(2)}ms - Mede o tempo de execução de um loop síncrono com 10 milhões de iterações. Serve como indicador aproximado da capacidade de processamento do ambiente onde o teste está rodando (ex: Azure Pipeline). Não deve ser utilizado como métrica de performance da aplicação, pois não envolve rede, I/O ou renderização.`
    );

    // quando o browser começa a carregar
    cy.on('window:before:load', (win) => {
      const now = Date.now();
      const msg = `window:before:load - Tempo de carregamento do window => ${(now - start) / 1000}s`;

      logsVisit.push(msg);
    })

    // quando a página terminou de carregar
    cy.on('window:load', (win) => {
      const now = Date.now();
      const msg = `window:load - Terminado carregamento do window ${(now - start) / 1000}s`;

      logsVisit.push(msg);
    });

    // tipagem por conta do typescript
    let url: string | undefined;
    let options: Partial<Cypress.VisitOptions> | undefined;

    if (typeof args[0] === 'string') {
      url = args[0];
      options = args[args.length - 1] as Partial<Cypress.VisitOptions> | undefined;
    } else {
      options = args[0] as Partial<Cypress.VisitOptions>;
    }

    // quando o hook onBeforeLoad rodou
    const userOnBeforeLoad = options?.onBeforeLoad;
    if (options) {
      if (options.onBeforeLoad) {
        options.onBeforeLoad = (win) => {
          const now = Date.now();
          const msg = `onBeforeLoad - Tempo de carregamentodo beforeLoad => ${(now - start) / 1000}s`;

          logsVisit.push(msg);

          if (typeof userOnBeforeLoad === 'function') {
            userOnBeforeLoad(win);
          }
        };
      }
    }

    // executa o visit original com os mesmos args do original
    return (originalFn as any)(...(url ? [url, options] : [options])).then(() => {
      const end = Date.now();
      const visitTime = ((end - start) / 1000).toFixed(2);
      const msg = `Tempo total cy.visit => ${visitTime}s`;

      logsVisit.push(msg);
    }
    ).then(() => {
      return logsVisit
    })
  })
});
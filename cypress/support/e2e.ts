/// <reference types="cypress" />
/// <reference types="cypress-xpath" />

require('cypress-xpath');
// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
import 'cypress-plugin-api'

// Alternatively you can use CommonJS syntax:
// require('./commands')

/**
 * This file just imports commands.{js|ts}
 */

Cypress.on('uncaught:exception', (err, runnable) => {
  // Retorne false para impedir que Cypress falhe no teste
  return false;
});

// redefinição da prioridade de locators, ao usar o seletor de locators do cypress
Cypress.SelectorPlayground.defaults({
  selectorPriority: ['data-qa-selector', 'data-test', 'id', 'class', 'attributes', 'tag', 'nth-child'],
})
/// <reference types="cypress" />

declare namespace Cypress {
	interface Chainable<Subject = any> {
		resetDatabase(): Chainable<Subject>;
	}
}

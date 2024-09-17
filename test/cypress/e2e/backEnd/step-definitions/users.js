// describe('tst api ', () => {
//   it.only('first test', () => {
//     cy.request('api/users')
//   })
// })

import {
  Given,
  When,
  Then,
  Before,
} from '@badeball/cypress-cucumber-preprocessor'

let userData = {}

// Before(() => {
//   cy.resetDatabase()
// })

Given('I have the following user data', (dataTable) => {
  // Extract user data from the dataTable
  dataTable.hashes().forEach((row) => {
    userData = {
      name: row.name,
      email: row.email,
      password: row.password,
    }
  })
})

When('I create a new user', () => {
  // Make a GET request to create a new user
  cy.request({
    method: 'GET',
    url: '/api/users/create', // Replace with the actual API endpoint
    body: userData,
    failOnStatusCode: false, // to handle assertions manually
  }).as('createUserResponse')
})

Then('the response status should be {int}', (statusCode) => {
  cy.get('@createUserResponse').its('status').should('equal', statusCode)
})

// After(() => {
//   cy.resetDatabase()
// })

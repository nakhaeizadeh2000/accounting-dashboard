import { When, Then, Given } from "@badeball/cypress-cucumber-preprocessor";


Given('i am on empty home page',()=>{
  cy.visit('/')
})

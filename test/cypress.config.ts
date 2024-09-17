import { defineConfig } from "cypress";
import createBundler from "@bahmutov/cypress-esbuild-preprocessor";
import { addCucumberPreprocessorPlugin } from "@badeball/cypress-cucumber-preprocessor";
import createEsbuildPlugin from "@badeball/cypress-cucumber-preprocessor/esbuild";

async function setupNodeEvents(
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions
): Promise<Cypress.PluginConfigOptions> {
  await addCucumberPreprocessorPlugin(on, config);
  on(
    "file:preprocessor",
    createBundler({
      plugins: [createEsbuildPlugin(config)],
    })
  );
  return config;
}

export default defineConfig({
  // Cypress configuration options
  video: false,
  viewportWidth: 1280,
  viewportHeight: 720,
  defaultCommandTimeout: 8000,
  pageLoadTimeout: 60000,

  // Custom E2E configuration
  e2e: {
    baseUrl: "http://localhost", // Base URL for the application
    specPattern: ['cypress/e2e/backEnd/features/**/*.feature', 'cypress/e2e/frontEnd/features/**/*.feature'], // Pattern for locating feature files in the integration folder
    setupNodeEvents, // Function for setting up Node events (including Cucumber preprocessor)
    retries: {
      runMode: 2,
      openMode: 0
    },
    reporter: "spec", // Reporter for displaying test results
    supportFile: 'cypress/support/index.ts', // Specify the support file
  },
});

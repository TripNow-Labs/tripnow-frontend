const { defineConfig } = require("cypress");

module.exports = defineConfig({
  allowCypressEnv: false,
  reporter: 'cypress-mochawesome-reporter',

  e2e: {
    setupNodeEvents(on, config) {
      // Configura o plugin de relatórios do Mochawesome
      require('cypress-mochawesome-reporter/plugin')(on);
    },
  },
});

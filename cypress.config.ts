import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents() {
      // implement node event listeners here
    },
  },
  env: {
    AUTH_SECRET: process.env.AUTH_SECRET,
  }
});

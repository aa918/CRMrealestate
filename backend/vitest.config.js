const { defineConfig } = require("vitest/config");

module.exports = defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./tests/setup.js"],
    fileParallelism: false, // tests share one Postgres database - avoid cross-test races
    testTimeout: 20000,
    hookTimeout: 30000,
  },
});

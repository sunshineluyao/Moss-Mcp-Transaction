import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Run tests in Node.js environment (not jsdom)
    environment: "node",
    // Exclude the live smoke test from the default run
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/__tests__/smoke.live.test.ts",
    ],
    // Reasonable timeout for integration tests that start subprocesses
    testTimeout: 60_000,
    hookTimeout: 60_000,
    // Run tests sequentially to avoid port conflicts between test suites
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
});

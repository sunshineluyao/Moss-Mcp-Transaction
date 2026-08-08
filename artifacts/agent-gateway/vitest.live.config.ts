import { defineConfig } from "vitest/config";

/**
 * Vitest config for live network tests only.
 * Run via: pnpm test:live
 * Hits the real Monad Testnet RPC — requires network access.
 */
export default defineConfig({
  test: {
    environment: "node",
    // Only the smoke test — nothing else
    include: ["**/__tests__/smoke.live.test.ts"],
    testTimeout: 30_000,
    hookTimeout: 15_000,
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
});

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    // No test may reach the network: tests/setup/no-network.ts refuses any connection off this machine (P4).
    setupFiles: ['tests/setup/no-network.ts'],
    environment: 'node',
    testTimeout: 20_000,
    coverage: {
      provider: 'v8',
      include: ['src/core/**', 'src/contracts/**', 'src/actions/**', 'src/engine/**'],
      reporter: ['text-summary'],
    },
  },
});

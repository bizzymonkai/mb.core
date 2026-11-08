import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@notention/core': fileURLToPath(new URL('./core/vendor/notention', import.meta.url)),
    },
  },
  test: {
    include: ['core/src/**/*.test.ts', 'node/**/*.test.ts'],
  },
});

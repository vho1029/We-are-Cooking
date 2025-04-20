import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    coverage: {
      provider: 'v8', // use V8-style coverage
      reporter: ['text', 'lcov'], // CLI + Codecov compatible
      exclude: ['src/setupTests.js'], // skip setup file
    },
  },
});

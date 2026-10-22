/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    // Playwright owns e2e/; Vitest would otherwise pick up its *.spec.ts files.
    exclude: ['node_modules', 'dist', 'e2e'],
  },
});

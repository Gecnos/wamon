import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Allow opening index.html directly from USB or static file server
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsInlineLimit: 4096,
  },
  test: {
    globals: true,
    environment: 'node',
  },
});

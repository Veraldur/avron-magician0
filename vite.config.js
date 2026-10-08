import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  base: './',

  server: {
    port: 5173,
    strictPort: true
  },

  build: {
    target: 'es2020',
    outDir: 'dist',
    emptyOutDir: true
  },

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});

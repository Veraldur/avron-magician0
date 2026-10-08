import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import { cpSync, existsSync } from 'node:fs';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  base: './',

  server: {
    port: 5173,
    strictPort: true
  },

  build: {
    target: 'es2020',
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      plugins: [
        {
          name: 'copy-game-assets',
          writeBundle() {
            const source = fileURLToPath(new URL('./assets/', import.meta.url));
            const destination = fileURLToPath(new URL('./dist/assets/', import.meta.url));

            if (!existsSync(source)) {
              throw new Error(`Game assets directory not found: ${source}`);
            }

            cpSync(source, destination, { recursive: true });
          }
        }
      ]
    }
  },

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});

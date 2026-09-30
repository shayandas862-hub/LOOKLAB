import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

const engine = `http://127.0.0.1:${process.env.LOOKLAB_PORT ?? 4317}`;

export default defineConfig({
  root: resolve(import.meta.dirname, 'src/ui'),
  plugins: [react()],
  build: {
    outDir: resolve(import.meta.dirname, 'dist/ui'),
    emptyOutDir: true,
    sourcemap: false,
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      '/api': { target: engine, changeOrigin: true },
      '/mcp': { target: engine, changeOrigin: true },
    },
  },
});

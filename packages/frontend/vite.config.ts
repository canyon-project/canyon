import react from '@vitejs/plugin-react';
import * as path from 'path';
import { defineConfig } from 'vite';
import Pages from 'vite-plugin-pages';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    Pages({
      exclude: ['**/views/**', '**/components/**'],
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    sourcemap: true,
  },
  server: {
    port: 8000,
    host: '0.0.0.0',
    proxy: {
      '^/graphql|^/api': {
        changeOrigin: true,
        target: 'http://localhost:8080',
      },
    },
  },
});

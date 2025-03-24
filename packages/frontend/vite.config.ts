import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import Pages from 'vite-plugin-pages';
import * as path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
    }),
    Pages({
      dirs: 'src/routes',
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
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

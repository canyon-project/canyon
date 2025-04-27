import react from '@vitejs/plugin-react';
import * as path from 'path';
import { defineConfig } from 'vite';
import Pages from 'vite-plugin-pages';
import tailwindcss from '@tailwindcss/vite';

const ReactCompilerConfig = {
  target: '19', // '17' | '18' | '19'
};

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', ReactCompilerConfig]],
      },
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
  build: {
    sourcemap: true,
    target: 'ES2022',
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

import * as path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import Pages from 'vite-plugin-pages';


export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const serverPort = Number(env.VITE_PORT) || 8000;
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:8080';
  return {
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
        // 'canyon-report': path.resolve(__dirname, '../report/src/index.tsx'),
      },
    },
    build: {
      sourcemap: true,
    },
    server: {
      port: serverPort,
      host: '0.0.0.0',
      proxy: {
        '^/api': {
          changeOrigin: true,
          target: apiProxyTarget,
        },
      },
    },
  };
});

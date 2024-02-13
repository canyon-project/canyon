import react from '@vitejs/plugin-react';
import * as path from 'path';
import { defineConfig } from 'vite';
import Pages from 'vite-plugin-pages';
// import svgr from 'vite-plugin-svgr'
// import * as path from 'path';
// https://vitejs.dev/config/
const resolve = (p: string) => path.resolve(__dirname, p);
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins:
          process.env.NODE_ENV === 'development'
            ? []
            : [
                'istanbul',
                [
                  'canyon',
                  {
                    instrumentCwd: resolve('../..'),
                  },
                ],
              ],
      },
    }),
    // svgr(),
    Pages({
      exclude: ['**/helper/**'],
    }),
  ],
  resolve: {
    alias: {
      // '@canyon/report': path.resolve('../canyon-report/src'),
      // '@': path.resolve(__dirname, './src'),
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
        target: 'http://10.128.59.28',
        changeOrigin: true,
      }
    },
  },
});

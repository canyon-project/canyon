import react from '@vitejs/plugin-react-swc';
import * as path from 'path';
import { defineConfig } from 'vite';
import Pages from 'vite-plugin-pages';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react({
      plugins:
        process.env.NODE_ENV === 'x'
          ? [
              ['swc-plugin-coverage-instrument', {}],
              // ['swc-plugin-canyon',{
              //   projectID: process.env.GITHUB_REPOSITORY,
              //   sha: process.env.GITHUB_SHA,
              //   dsn: process.env.DSN,
              //   reporter: process.env.REPORTER,
              //   branch: process.env.GITHUB_REF,
              //   instrumentCwd: process.cwd(),
              //   compareTarget: 'dev', //可选
              //   buildID: process.env.GITHUB_RUN_ID,
              //   buildProvider: 'github',
              // }],
            ]
          : [],
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

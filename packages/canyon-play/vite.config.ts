import react from '@vitejs/plugin-react';
import * as path from 'path';
import { defineConfig } from 'vite';
import Pages from 'vite-plugin-pages';
// import svgr from 'vite-plugin-svgr'
// import * as path from 'path';
// https://vitejs.dev/config/
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [
    svgr(),
    Pages({
      exclude: ['**/helper/**'],
    }),
  ],
  resolve: {
    alias: {
      '@canyon/ui': path.resolve('../canyon-ui/src'),
      // '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 16888,
    host: '0.0.0.0',
  },
});

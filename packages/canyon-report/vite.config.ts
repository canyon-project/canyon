import preact from '@preact/preset-vite';
import { resolve } from 'path';
import * as path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [preact(), dts()],
  resolve: {
    alias: {
      '@canyon/data': path.resolve('../canyon-data/src'),
      // '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    commonjsOptions: {},
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      fileName: 'canyon-report',
      name: 'CanyonReport',
    },
  },
});

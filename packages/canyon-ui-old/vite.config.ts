import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import Pages from 'vite-plugin-pages';
export default defineConfig({
  plugins: [
    Pages({
      exclude: ['**/helper/**'],
    }),
    dts(),
  ],
  build: {
    outDir: './dist',
    emptyOutDir: true,
    commonjsOptions: {},
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      fileName: 'canyon-ui-old',
      name: 'CanyonUiOld',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'antd'],
    },
  },
});

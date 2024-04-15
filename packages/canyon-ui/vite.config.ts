import react from '@vitejs/plugin-react';
import * as path from 'path';
import dts from 'vite-plugin-dts';
// import svgr from 'vite-plugin-svgr'
// import * as path from 'path';
// https://vitejs.dev/config/
import { resolve } from 'path';
import { defineConfig } from 'vite';
import Pages from 'vite-plugin-pages';
export default defineConfig({
  plugins: [
    // svgr(),
    Pages({
      exclude: ['**/helper/**'],
    }),
    dts()
  ],
  build: {
    outDir: './dist',
    emptyOutDir: true,
    commonjsOptions: {},
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      fileName: 'canyon-ui',
      name: 'CanyonUi',
    },
    // 自定义构建配置，可直接调整底层Rollup选项；Rollup有一套预设
    // https://rollupjs.org/guide/en/#big-list-of-options
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['react', 'react-dom', 'antd'],
      // output: {
      //   // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
      //   globals: {
      //     vue: "Vue",
      //   },
      // },
    },
  },
});

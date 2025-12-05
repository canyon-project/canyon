import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      // 组件库名称
      name: 'CanyonReportSpa',
      fileName: 'index',
      formats: ['umd', 'es'], // 打包为通用模块
    }
  },
});

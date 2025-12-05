import react from '@vitejs/plugin-react';
// @ts-expect-error
import dts from 'unplugin-dts/vite';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    dts({ tsconfigPath: './tsconfig.app.json' }),
  ],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    target: 'ES2022',
    // 输出文件夹
    outDir: 'dist',
    lib: {
      entry: 'src/index.tsx',
      // 组件库名称
      name: 'CanyonReport',
      fileName: 'canyon-report',
      formats: ['umd', 'es'], // 打包为通用模块
    },
    rolldownOptions: {
      external: [
        'react',
        'react-dom',
        'monaco-editor',
        // "@monaco-editor/react",
        'antd',
        // "@ant-design/icons",
      ],
      output: {
        // NOTE: 不定义变量名会报错，react会被定义成$$require
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          antd: 'antd',
          'monaco-editor': 'monaco',
        },
      },
    },
  },
});

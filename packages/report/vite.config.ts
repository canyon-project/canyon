import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import { compression } from 'vite-plugin-compression2';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // 启用 babel 插件以提高性能
      babel: {
        plugins: [process.env.NODE_ENV === 'production' && 'babel-plugin-react-compiler'].filter(
          Boolean
        ),
      },
    }),
    // 添加打包分析插件
    process.env.ANALYZE &&
      visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
    // 添加压缩插件
    compression({
      include: [/\.(js|css|html|svg)$/],
      threshold: 1024, // 只有大于1kb的文件才会被压缩
    }),
  ].filter(Boolean),
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    target: 'ES2022',
    // 输出文件夹
    outDir: 'dist',
    // 启用源码映射以便于调试
    sourcemap: process.env.NODE_ENV !== 'production',
    // 启用 minify 以减小文件体积
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: process.env.NODE_ENV === 'production',
      },
    },
    lib: {
      entry: 'src/index.tsx',
      // 组件库名称
      name: 'CanyonReport',
      fileName: 'canyon-report',
      formats: ['umd', 'es'], // 打包为通用模块
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'monaco-editor',
        '@monaco-editor/react',
        'antd',
        '@ant-design/icons',
        'react-highlight-words',
        'istanbul-lib-coverage',
      ],
      output: {
        // NOTE: 不定义变量名会报错，react会被定义成$$require
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          antd: 'antd',
          'monaco-editor': 'monaco',
          '@monaco-editor/react': 'MonacoEditor',
          '@ant-design/icons': 'AntIcons',
          'react-highlight-words': 'ReactHighlightWords',
          'istanbul-lib-coverage': 'istanbulLibCoverage',
        },
        // 优化 chunk 分割
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
});

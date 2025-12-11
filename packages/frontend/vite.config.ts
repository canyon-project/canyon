import react from '@vitejs/plugin-react'
import * as path from 'path'
import { defineConfig } from 'vite'
import Pages from 'vite-plugin-pages'
import tailwindcss from '@tailwindcss/vite'

const apiTarget = process.env.VITE_API_TARGET || 'http://127.0.0.1:8080'

export default defineConfig({
  plugins: [
    react({
      babel:{
        plugins:process.env.NODE_ENV ==='production' ? []:[
          'istanbul',
          'canyon'
        ]
      }
    }),
    Pages({
      exclude: ['**/views/**', '**/helpers/**'],
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8000,
    host: '0.0.0.0',
    proxy: {
      '^/graphql|^/api': {
        changeOrigin: true,
        target: apiTarget,
      },
    },
  },
})

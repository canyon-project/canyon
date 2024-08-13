import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import istanbul from 'vite-plugin-istanbul'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    istanbul({
    forceBuildInstrument:true
  }),
  ],
})

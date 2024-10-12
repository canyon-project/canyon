import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import istanbul from 'vite-plugin-istanbul'
import canyon from 'vite-plugin-canyon'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    istanbul({
      forceBuildInstrument: true
    }),
    canyon()
  ],
})

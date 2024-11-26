import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react-swc'
import istanbul from 'vite-plugin-istanbul'
import canyonPlugin from "./src";
// https://vitejs.dev/config/
export default defineConfig({
  plugins:[
    istanbul({
      forceBuildInstrument: true,
    }),
    canyonPlugin()
  ],
  build: {
    lib: {
      entry: 'feature/main.ts',
      name: 'vite-ts-lib'
    },
    outDir: 'dist-test',
  },
})

import { defineConfig } from 'rolldown'

export default defineConfig({
  input: 'src/main.ts',
  platform: 'node',
  output:{
    format:'commonjs',
    sourcemap:true
  }
})

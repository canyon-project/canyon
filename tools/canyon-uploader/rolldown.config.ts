import { defineConfig } from 'rolldown'
const obj:{name:number} = {
  name:1
}
console.log(obj.name)
export default defineConfig({
  input: 'src/main.ts',
  platform: 'node',
  output:{
    format:'commonjs'
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import Pages from "vite-plugin-pages";
import tailwindcss from "@tailwindcss/vite";
// https://vite.dev/config/
export default defineConfig({
  plugins: [
      react(),
    Pages({
      dirs:[
        {
          dir: 'src/pages', baseRoute: '',
        },
        {
          dir: 'src/cov-pages', baseRoute: ':provider/:org/:repo',
        }
      ],
      exclude: ["**/helper/**", "**/components/**"],
    }),
    tailwindcss(),],
  server:{
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})

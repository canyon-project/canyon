import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import Pages from "vite-plugin-pages";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({}),
    Pages({
      exclude: ["**/helper/**", "**/components/**"],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: true,
  },
  server: {
    port: 8000,
    host: "0.0.0.0",
    proxy: {
      "^/graphql|^/api": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
      },
    },
  },
});

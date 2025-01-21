import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import Pages from "vite-plugin-pages";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    Pages({
      exclude: ["**/helper/**", "**/components/**"],
    }),
  ],
  build: {
    target: "ESNext",
  },
  resolve: {
    alias: {
      // "@": path.resolve(__dirname, "./src"),
      "canyon-report": path.resolve(
        __dirname,
        "../canyon-report/src/components",
      ),
      // "canyon-data": path.resolve(__dirname, "../canyon-data/src"),
    },
  },
  server: {
    port: 8000,
    host: "0.0.0.0",
    proxy: {
      "^/graphql|^/api": {
        changeOrigin: true,
        target: "http://localhost:8080",
      },
    },
  },
});

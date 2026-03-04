import { defineConfig } from "vite";
import devServer from "@hono/vite-dev-server";
import build from "@hono/vite-build/node";
import react from "@vitejs/plugin-react-swc";
import Pages from "vite-plugin-pages";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { copyPrismaEngines } from "./copyPrismaEngines.ts";

export default defineConfig({
  build: {
    target: "es2022", // 支持 top-level await
  },
  plugins: [
    react(),
    Pages({
      exclude: ["**/views/**", "**/helpers/**"],
    }),
    tailwindcss(),
    build({
      entry: "./src/api/index.ts",
      port: 8080,
      external: ["@prisma/client"],
    }),
    devServer({
      entry: "./src/api/index.ts",
      // 不带 /api 的请求交给 Vite，带 /api 的由 Hono 处理
      exclude: [/^(?!\/api(\/|$|\?))/],
    }),
    copyPrismaEngines(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: "0.0.0.0",
  },
});

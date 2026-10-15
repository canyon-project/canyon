import { defineConfig } from "vite";
import devServer from "@hono/vite-dev-server";
import build from "@hono/vite-build/node";
import react from "@vitejs/plugin-react";
import Pages from "vite-plugin-pages";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  build: {
    target: "es2022",
  },
  define:{
    __APP_VERSION__: JSON.stringify("v3.0.15"),
    __APP_BUILD_DATE__: JSON.stringify(new Date().toISOString()),
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
      external: ["@prisma/client", "better-sqlite3"],
    }),
    devServer({
      entry: "./src/api/index.ts",
      exclude: [/^(?!\/api(\/|$|\?))/],
    }),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 3000,
    host: "0.0.0.0",
  },
});

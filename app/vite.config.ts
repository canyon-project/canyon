import { defineConfig } from "vite";
import devServer from "@hono/vite-dev-server";
import build from "@hono/vite-build/node";
import react from "@vitejs/plugin-react-swc";
import Pages from "vite-plugin-pages";
import tailwindcss from "@tailwindcss/vite";
import { copyPrismaEngines } from "./copyPrismaEngines.ts";

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  console.log('当前是【生产环境】');
} else {
  console.log('当前是【开发/测试环境】');
}

export default defineConfig({
  build: {
    target: "es2022",
  },
  plugins: [
    react({
      plugins: isProduction ? [["swc-plugin-coverage-instrument", {}],["@canyonjs/swc-plugin",{
      }]] : [],
    }),
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
      exclude: [/^(?!\/api(\/|$|\?))/],
    }),
    copyPrismaEngines(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 3000,
    host: "0.0.0.0",
  },
});

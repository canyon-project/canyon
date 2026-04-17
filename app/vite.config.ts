import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import devServer from "@hono/vite-dev-server";
import build from "@hono/vite-build/node";
import react from "@vitejs/plugin-react";
import Pages from "vite-plugin-pages";
import tailwindcss from "@tailwindcss/vite";
import { copyPrismaEngines } from "./copyPrismaEngines.ts";
import istanbulPlugin from "vite-plugin-istanbul";
import canyonVitePlugin from "@canyonjs/vite-plugin";

const isProduction = process.env.NODE_ENV === "production";

const pkg = JSON.parse(
  readFileSync(fileURLToPath(new URL("./package.json", import.meta.url)), "utf-8"),
) as { version: string };

const gitCommit =
  process.env.VITE_GIT_COMMIT ||
  process.env.GITHUB_SHA?.slice(0, 12) ||
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ||
  "development";

if (isProduction) {
  console.log("当前是【生产环境】");
} else {
  console.log("当前是【开发/测试环境】");
}

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __APP_COMMIT__: JSON.stringify(gitCommit),
  },
  build: {
    target: "es2022",
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
      exclude: [/^(?!\/api(\/|$|\?))/],
    }),
    copyPrismaEngines(),
    ...(isProduction
      ? [
          istanbulPlugin({
            forceBuildInstrument: true,
          }),
          canyonVitePlugin(),
        ]
      : []),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 3000,
    host: "0.0.0.0",
  },
});

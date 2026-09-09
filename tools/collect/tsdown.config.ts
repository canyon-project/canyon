import { defineConfig } from "tsdown";

/** Next 10 / webpack 4 等旧打包器无法解析 `?.` / `??`，需降到 ES2015。 */
const browserCompat = {
  platform: "browser" as const,
  target: "es2015" as const,
};

export default defineConfig([
  {
    entry: "./src/index.ts",
    ...browserCompat,
    format: "esm",
    dts: true,
  },
  {
    entry: "./src/iife.ts",
    ...browserCompat,
    format: "iife",
    dts: false,
    outputOptions: {
      entryFileNames: "index.iife.js",
    },
  },
]);

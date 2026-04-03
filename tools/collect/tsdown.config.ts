import { defineConfig } from "tsdown";

export default defineConfig([
  {
    entry: "./src/index.ts",
    platform: "browser",
    format: "esm",
    dts: true,
  },
  {
    entry: "./src/iife.ts",
    platform: "browser",
    format: "iife",
    dts: false,
    outputOptions: {
      entryFileNames: "index.iife.js",
    },
  },
]);

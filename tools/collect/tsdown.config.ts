import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "./src/index.ts",
  platform: "browser",
  format: ["esm", "iife"],
  globalName: "CanyonCollect",
  dts: true,
});

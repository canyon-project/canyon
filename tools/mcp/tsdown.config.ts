import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "./src/index.ts",
  platform: "node",
  format: "esm",
  dts: true,
  shims: true,
});

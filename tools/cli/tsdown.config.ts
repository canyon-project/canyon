import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "src/cli.ts",
  format: "esm",
  platform: "node",
  clean: true,
  dts: false,
  banner: {
    js: "#!/usr/bin/env node",
  },
});

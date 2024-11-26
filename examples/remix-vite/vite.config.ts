import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import Istanbul from 'vite-plugin-istanbul'
import Canyon from 'vite-plugin-canyon'

export default defineConfig({
  plugins: [
    remix({
      ignoredRouteFiles: ["**/*.css"],
    }),
    tsconfigPaths(),
    Istanbul(),
    Canyon({
      // 设置对比分支
      compareTarget: "main",
    }),
  ],
});

import { defineConfig } from "vite";
import canyonVitePlugin from "./dist/index.mjs";
import istanbul from "vite-plugin-istanbul";
export default defineConfig({
  plugins: [
    istanbul({
      forceBuildInstrument: true,
    }),
    canyonVitePlugin({
      babelPluginOptions: {
        repoID: "9050",
        sha: "xxxxx",
        provider: "gitlab",
        buildTarget: "",
        ci: true,
        keepMap: true,
      },
    }),
  ],
  build: {
    outDir: "features-dist",
    emptyOutDir: true,
    minify: false,
    sourcemap: true,
    rollupOptions: {
      input: {
        add: "./features/add.js",
        subtract: "./features/subtract.js",
      },
      output: {
        entryFileNames: "[name].js",
      },
    },
  },
});

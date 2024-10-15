import { resolve } from "path"
import { defineConfig } from "vite"
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins:[dts()],
  build: {
    outDir: "./dist",
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      fileName: "canyon-data",
      formats: ["es", "cjs"],
    },
    sourcemap: true,
  },
})

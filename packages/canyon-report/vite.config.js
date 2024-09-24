import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({})],
  define: {
    'process.env': {},
  },
  build:
      process.env.USE_DTS_PLUGIN === "true"
          ? {
            lib: {
              entry: resolve(__dirname, "app/src/components/index.js"),
              fileName: "canyon-report",
              name: "CanyonReport",
            },
            rollupOptions: {
              external: ["react", "react-dom"],
            }
          }
          : {
          lib: {
            entry: resolve(__dirname, "app/src/main.jsx"),
            fileName: "v",
            name: "v",
          }
        },
});

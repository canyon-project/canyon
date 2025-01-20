import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: "ES2022",
    // 输出文件夹
    outDir: "dist",
    lib: {
      entry: "src/components/report.tsx",
      // 组件库名称
      name: "canyon-report",
      fileName: "canyon-report",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "monaco-editor",
        "@monaco-editor/react",
        "antd",
        "@ant-design/icons",
      ],
    },
  },
});

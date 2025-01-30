import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxImportSource: "@emotion/react",
    }),
  ],
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    target: "ES2022",
    // 输出文件夹
    outDir: "dist",
    lib: {
      entry: "src/components/report.tsx",
      // 组件库名称
      name: "CanyonReport",
      fileName: "canyon-report",
      formats: ["umd", "es"], // 打包为通用模块
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "monaco-editor",
        // "@monaco-editor/react",
        "antd",
        // "@ant-design/icons",
      ],
    },
  },
});

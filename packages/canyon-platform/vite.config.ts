import react from "@vitejs/plugin-react";
import * as path from "path";
import AutoImport from "unplugin-auto-import/vite";
import AntdResolver from "unplugin-auto-import-antd";
import { defineConfig } from "vite";
import Pages from "vite-plugin-pages";

export default defineConfig({
    plugins: [
        react({
            babel: {
                plugins: process.env.NODE_ENV === "development" ? [] : [],
            },
        }),
        AutoImport({
            imports: ["react", "react-i18next", "react-router-dom"],
            dts: "./src/auto-imports.d.ts",
            resolvers: [AntdResolver()],
        }),
        Pages({
            exclude: ["**/helper/**", "**/components/**"],
        }),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            // "canyon-report": path.resolve(__dirname, "../canyon-report"),
            // "canyon-data": path.resolve(__dirname, "../canyon-data/src"),
        },
    },
    build: {
        sourcemap: true,
    },
    server: {
        port: 8000,
        host: "0.0.0.0",
        proxy: {
            "^/graphql|^/api": {
                target: "http://127.0.0.1:8080",
                changeOrigin: true,
            },
        },
    },
});

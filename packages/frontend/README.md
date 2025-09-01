## Canyon Frontend (Vite + React)

基于 Vite、React、Ant Design 与 Apollo GraphQL 的前端应用。

### 功能概览
- 浏览仓库、提交、Pull/MR 列表
- 覆盖率报表页（内置 `canyon-report` 组件）
- 多语言（中/英/日）与暗色主题

### 目录结构
- `src/`
  - `pages/` 基于 `vite-plugin-pages` 的文件路由
  - `components/` 通用组件（含覆盖率报表）
  - `helpers/` GraphQL 查询与代码生成
  - `layouts/` 页面布局

### 运行依赖
- Node.js 18+
- 后端服务（默认 `http://127.0.0.1:8080`）

### 环境变量
- `VITE_API_TARGET`：开发代理目标，默认为 `http://127.0.0.1:8080`

### 安装与启动
1. 安装依赖（在仓库根目录执行）
```bash
pnpm i
```
2. 生成 GraphQL Client 代码（postinstall 会自动执行）
```bash
pnpm --filter frontend run codegen
```
3. 启动开发服务器
```bash
pnpm --filter frontend dev
```
访问 `http://127.0.0.1:8000`

### 路由说明
- 采用 `vite-plugin-pages`，文件即路由；页面位于 `src/pages`
- 覆盖报告直达路由：`/report/-/:provider/:org/:repo/:subject/:subjectID/-*`

### 代理配置（开发环境）
`vite.config.ts` 中：
```ts
server: {
  port: 8000,
  proxy: {
    '^/graphql|^/api': { target: process.env.VITE_API_TARGET, changeOrigin: true }
  }
}
```

### 常见问题
- 首次运行找不到 GraphQL 类型：请执行 `pnpm --filter frontend run codegen`
- 报表无法访问后端：检查 `VITE_API_TARGET` 与后端端口



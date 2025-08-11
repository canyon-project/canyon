## Canyon 前端（packages/frontend）

### 简介
基于 React 19 + Vite 6 + TypeScript + Ant Design 5 的前端应用，用于展示代码覆盖率与相关代码数据。采用文件式路由与 API 代理对接后端服务。

### 技术栈
- **框架**: React 19, React Router 7
- **构建**: Vite 6, TypeScript
- **UI**: Ant Design 5, Tailwind CSS 4
- **路由**: vite-plugin-pages（文件式路由）
- **测试**: Vitest（支持 Istanbul 覆盖率）
- **网络**: Axios（接口前缀 `/api`，通过 Vite 代理到后端）

### 目录结构（节选）
```
packages/frontend/
  src/
    pages/                     # 文件式路由入口
      index/[provider]/[org]/[repo]/index/
        commits/               # 单个 commit 覆盖率视图
        multiple-commits/      # 多个 commit 对比
        pulls/                 # Pull Request 视图
    components/
      CoverageFileDrawer.tsx   # 文件抽屉&内容查看
      CoverageReport.tsx       # 全页面的报告视图（/report/- 路由）
    helper/                    # 请求&工具函数
    locales/                   # 多语言文案
    i18n.ts                    # i18n 初始化
  vite.config.ts               # Vite 配置（含代理）
  package.json                 # 项目脚本与依赖
```

### 路由说明
- 文件式路由由 `vite-plugin-pages` 自动生成。
- 特殊报告路由在 `src/App.tsx` 中追加：
  - 路由模式：`/report/-/:provider/:org/:repo/:subject/:subjectID/-*`
  - 示例：`/report/-/gitlab/myorg/myrepo/pulls/9/-/src/App.tsx`
- 普通页面路径示例：
  - 单个提交：`/:provider/:org/:repo/commits/:sha/-/*`
  - 多个提交：`/:provider/:org/:repo/multiple-commits/:shas/-/*`
  - Pull 请求：`/:provider/:org/:repo/pulls/:iid/-/*`

### 本地开发
前置：确保后端在 `http://localhost:8080` 运行（Vite 代理已指向该地址）。

方式一（在包内运行）：
```bash
cd packages/frontend
pnpm install
pnpm dev
```

方式二（从仓库根，使用 filter）：
```bash
pnpm -F frontend install
pnpm -F frontend dev
```

默认开发服务器：`http://localhost:8000`

### 构建与预览
```bash
pnpm -F frontend build
```
产物位于 `packages/frontend/dist`，可用任何静态文件服务托管。

### 测试
```bash
pnpm -F frontend do-test
```

### 接口与代理
- 统一前缀：`/api`（Axios 请求应以此为前缀）
- 代理配置：`vite.config.ts` 中将 `^/graphql|^/api` 转发至 `http://localhost:8080`

### 国际化
- 文案位于 `src/locales/`（`cn.json`、`en.json`、`ja.json`）
- 初始化在 `src/i18n.ts`

### 约定与规范
- 新页面请遵循文件式路由的目录组织，落位于 `src/pages/index/[provider]/[org]/[repo]/index/...`
- 网络请求使用 Axios，并统一以 `/api` 为前缀
- 代码风格：使用 `eslint-config-canyon` 与 Prettier

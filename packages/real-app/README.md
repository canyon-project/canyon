# @canyon/real-app

待办示例应用：TypeScript → tsc → webpack + `@canyonjs` / istanbul 插桩，产出 Canyon 所需的 `.canyon_output`。

## 目录

| 路径 | 说明 |
| --- | --- |
| `app/` | 业务源码 |
| `web/` | 静态资源（样式等） |
| `config/` | tsconfig、babel、webpack |
| `.artifacts/tsc/` | tsc 中间产物（gitignore） |
| `dist/` | 浏览器 bundle（gitignore） |
| `.canyon_output/` | 插桩 map JSON（gitignore，e2e / CI 构建后读取） |

## 命令

```bash
pnpm --filter @canyon/real-app build
```

本地预览：在包根目录用静态服务器打开 `index.html`（依赖 `dist/bundle.js`）。

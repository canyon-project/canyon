# Canyon Docs

`docs` 目录是 Canyon 的文档站点，基于 Next.js + Nextra 构建。

## 技术栈

- [Next.js](https://nextjs.org)
- [Nextra](https://nextra.site)
- [nextra-theme-docs](https://nextra.site/docs/docs-theme/start)

## 本地开发

在仓库根目录执行：

```bash
pnpm install
pnpm --filter docs dev-docs
```

默认访问：`http://localhost:3000`

## 构建与启动

在仓库根目录执行：

```bash
pnpm --filter docs build
pnpm --filter docs start
```

说明：

- `build` 完成后会自动执行 `postbuild`
- `postbuild` 会生成 Pagefind 搜索索引和 LLM 文档产物

## 目录说明

- `content/docs/`：文档内容（mdx）
- `app/`：Next.js App Router 页面与主题配置
- `public/`：静态资源

## 在线文档

- [https://docs.canyonjs.io](https://docs.canyonjs.io)

# Canyon Docs

基于 Rspress 的文档站。核心内容：PR / MR CI 中的覆盖率闭环（init → client → snapshot → 轮询 → 概览）。

```bash
pnpm --filter docs dev
```

默认 <http://localhost:5173>（以终端输出为准）。

## GitHub Pages

推送到 `next` 分支会触发 [`.github/workflows/deploy-docs.yml`](../../.github/workflows/deploy-docs.yml)，部署到：

https://canyon-project.github.io/canyon/

仓库 Settings → Pages → Source 选 **GitHub Actions**。

# Canyon Extension

面向浏览器的 Canyon 覆盖率上报与调试辅助插件（MV3）。支持在任意页面注入脚本读取 `window.__coverage__` 与 `window.__canyon__`，并可一键上传到你的 Canyon 服务，或下载本地 JSON 便于排查。

## 功能特性

- 读取页面中的覆盖率与 Canyon 元数据
- 可配置间隔上报（0 关闭，范围 0-60 秒）
- 支持设置 `Report ID` 与 `Reporter`（Token）
- 一键上传覆盖率到 `dsn`
- 一键下载覆盖率 JSON 快照

## 目录结构

- `public/manifest.json`: Chrome MV3 清单
- `public/content-scripts.js`: 注入 `interceptor.js` 到页面，并桥接消息
- `public/interceptor.js`: 在页面上下文读写 `__coverage__`/`__canyon__` 并支持间隔上报
- `src/`: React 弹窗 UI 与业务逻辑

## 开发

```bash
pnpm i
pnpm dev
```

开发期间，使用 Chrome 加载已构建目录：

1. 执行 `pnpm build` 生成 `dist/`
2. Chrome -> 扩展程序 -> 开发者模式 -> 加载已解压的扩展程序 -> 选择 `tools/extension/dist`

## 打包

```bash
pnpm build
pnpm run buildzip
```

将生成 `canyon-extension.zip` 可直接用于商店或离线安装。

## 使用说明

- 页面存在 `window.__coverage__` 时，插件会显示覆盖率条目数量，并可下载 JSON
- 可设置：
  - `Interval Report`：区间 [0, 60] 秒，0 表示关闭
  - `Report ID`：相同 ID 的数据可在后端聚合
  - `Reporter`：即 Token，用于鉴权
- 点击 `Upload` 将向 `dsn` 发起上报，携带 `Authorization: Bearer <Reporter>`

更多文档请访问文档站点：<https://docs.canyonjs.org/zh/documentation/ecosystem/canyon-extension>

---
description: @canyonjs/babel-plugin 的作用、用法与 CI 行为说明。
---

# @canyonjs/babel-plugin

[`@canyonjs/babel-plugin`](https://www.npmjs.com/package/@canyonjs/babel-plugin) 是 Canyon 的 Babel 插桩插件。它与 `babel-plugin-istanbul` 配合，在构建期完成：

1. **CI 环境检测**：读取 GitLab / GitHub 等流水线变量，关联 commit
2. **Hit / Map 分离**：默认从产物中移除 map，降低体积
3. **buildHash 注入**：运行时 coverage 只保留轻量身份字段
4. **初始 map 落盘**：`ci: true` 时写入 `.canyon_output/`

## 安装

```bash
npm install -D @canyonjs/babel-plugin babel-plugin-istanbul
```

## 基本用法

```js
// babel.config.js
module.exports = {
  plugins: [
    'istanbul',
    [
      '@canyonjs/babel-plugin',
      {
        keepMap: false,
        include: ['src/**/*.{js,ts,tsx}'],
        exclude: ['**/*.{test,spec}.{js,ts,tsx}'],
      },
    ],
  ],
};
```

:::warning 顺序

`@canyonjs/babel-plugin` **必须**放在 `istanbul` 之后。

:::

## 配置项

详见 [API：Babel Plugin](/api/babel-plugin)。

常用项：

| 配置 | 说明 | 默认 |
| --- | --- | --- |
| `repoID` | 仓库 ID（CI 可自动检测） | `""` |
| `sha` | Commit SHA（CI 可自动检测） | `""` |
| `provider` | `gitlab` / `github` 等 | `""` |
| `buildTarget` | 多构建目标区分 | `""` |
| `ci` | 是否写出 `.canyon_output` | CI 下自动 `true` |
| `instrumentCwd` | 插桩工作目录 | `process.cwd()` |
| `include` / `exclude` | 文件过滤，语义同 Istanbul | `[]` |
| `extensions` | 参与匹配的扩展名 | `.js` `.ts` `.tsx` 等 |
| `keepMap` | 是否在产物中保留 map | `false` |

## CI 行为

当 `ci === true`（或检测到 CI 环境）时，每个被插桩文件会写出类似：

```text
.canyon_output/coverage-final-init-<random>.json
```

文件内容包含完整 map，以及：

- `buildHash`
- `provider` / `repoID` / `sha` / `buildTarget` / `instrumentCwd`

随后可用 `@canyonjs/cli` 上传到服务端。

## 与 Vite

若使用 Vite，可选用 [`@canyonjs/vite-plugin`](https://www.npmjs.com/package/@canyonjs/vite-plugin)，其内部复用本 Babel 插件能力。

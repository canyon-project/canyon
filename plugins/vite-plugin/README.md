# @canyonjs/vite-plugin

Vite 插件版本的 Canyon 插桩能力，内部直接复用 `@canyonjs/babel-plugin`。

如果你使用 Vite，希望在构建阶段完成 Istanbul + Canyon 插桩，可以直接使用本插件。

## 安装

```sh
npm install -D @canyonjs/vite-plugin vite-plugin-istanbul
```

## 使用

```ts
import { defineConfig } from "vite";
import istanbulPlugin from "vite-plugin-istanbul";
import canyonVitePlugin from "@canyonjs/vite-plugin";

const isProduction = process.env.NODE_ENV === "production";

export default defineConfig({
  plugins: [
    ...(isProduction
      ? [
          istanbulPlugin({
            forceBuildInstrument: true,
          }),
          canyonVitePlugin({
            repoID: "9050",
            sha: "xxxxx",
            provider: "gitlab",
            ci: true,
            keepMap: true,
          }),
        ]
      : []),
  ],
});
```

## 配置

`@canyonjs/vite-plugin` 会将配置直接透传给 `@canyonjs/babel-plugin`。当前可用参数：

- `repoID`
- `sha`
- `provider`
- `ci`
- `instrumentCwd`
- `keepMap`

详细含义、CI 自动检测与最佳实践，请参考 `@canyonjs/babel-plugin` 文档：

- https://github.com/canyon-project/canyon/blob/main/docs/content/docs/ecosystem/babel-plugin.mdx

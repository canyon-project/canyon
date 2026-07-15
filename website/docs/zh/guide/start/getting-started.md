---
description: 安装 Babel 插件，在 CI 中完成插桩、上传 map，并在运行时按 Scene 上报 hit。
---

# 快速开始

以下以 Babel + Istanbul 为例，走通 Canyon 的最小闭环。

## 1. 安装

```bash
npm install -D babel-plugin-istanbul @canyonjs/babel-plugin
```

## 2. 配置 Babel

将 Canyon 插件放在 **istanbul 之后**，以便在 AST 插桩结果上剥离 map 并注入 `buildHash`：

```js
// babel.config.js
module.exports = {
  plugins:
    process.env.CI
      ? [
          'istanbul',
          [
            '@canyonjs/babel-plugin',
            {
              // 一般由 CI 自动检测；本地调试可显式传入
              // repoID / sha / provider / buildTarget / ci
              keepMap: false,
            },
          ],
        ]
      : [],
};
```

:::tip 插件顺序

必须先 `istanbul`，再 `@canyonjs/babel-plugin`。Canyon 依赖 Istanbul 生成的 `coverageData` 对象完成 Hit/Map 分离。

:::

## 3. CI 构建并上传初始 Map

在 CI 中构建时，插件会：

1. 读取 CI 环境变量（GitLab / GitHub），关联 **commit SHA** 与仓库信息
2. 生成 `buildHash`
3. 将完整 map（含 `statementMap` / `fnMap` / `branchMap` 等）写入 `.canyon_output/`
4. 从运行时产物中移除 map，只保留 hit 计数结构与 `buildHash`

上传初始 map：

```yaml
# .gitlab-ci.yml（示例）
pages:
  image: node:20
  stage: deploy
  script:
    - npm run build
    - npx @canyonjs/cli upload --dsn=https://app.canyonjs.io/api/coverage/map/init
  only:
    - main
```

## 4. 运行时按 Scene 采集 Hit

部署插桩产物后，在页面中引入采集脚本，并用 **scene key/value** 标记当前用例：

```html
<script src="https://unpkg.com/@canyonjs/collect/dist/index.iife.js"></script>
<script>
  window.CANYON_DSN = 'https://app.canyonjs.io/api/coverage/client';
  window.CANYON_SCENE = {
    suite: 'checkout',
    caseId: 'pay-success',
  };
</script>
```

采集端只上报轻量 hit + `buildHash` + scene；服务端再通过 `buildHash` 找回对应 commit 的源码与 map。

## 5. 验证

构建并打开页面后，在控制台检查 `window.__coverage__`：

- 应能看到覆盖率对象
- 默认 `keepMap: false` 时，不应再包含 `statementMap` / `fnMap` / `branchMap` 等大型 map 字段
- 应包含 `buildHash`

## 下一步

- [整体架构](/guide/concepts/architecture)
- [BuildHash](/guide/concepts/build-hash)
- [分离 Hit 与 Map](/guide/concepts/separate-hit-and-map)
- [Babel Plugin](/guide/ecosystem/babel-plugin)

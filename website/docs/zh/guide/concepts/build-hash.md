---
description: buildHash 如何由 CI 的 repo / commit / provider 等字段生成，并串联 map 与 hit。
---

# BuildHash

`buildHash` 是 Canyon 的构建身份标识。它把 **CI 中的 commit / 仓库信息** 与 **插桩产物、初始 map、运行时 hit** 串成一条可查询的链路。

## 为什么需要它

E2E 场景下，测试环境往往只有打包后的 JS，没有完整源码树。Canyon 不在产物里塞入大段业务元数据，而是：

1. CI 插桩时根据构建配置生成稳定的 `buildHash`
2. 将 `repoID`、`sha`、`provider`、`buildTarget`、`instrumentCwd` 等写入 `.canyon_output` 的 map 文件
3. 运行时 hit 只携带 `buildHash`
4. 服务端用 `buildHash` 反查源码版本与 map，再还原覆盖率报告

## 如何计算

`@canyonjs/babel-plugin` 使用以下字段做稳定序列化后求 SHA-1：

| 字段 | 含义 |
| --- | --- |
| `provider` | 源码托管方，如 `gitlab` / `github` |
| `repoID` | 仓库 ID |
| `sha` | 当前 CI commit SHA |
| `buildTarget` | 构建目标（多产物时区分） |
| `instrumentCwd` | 插桩工作目录 |

```ts
// 概念示意：与插件 generateBuildHash 一致
buildHash = sha1(stableStringify({
  provider,
  repoID,
  sha,
  buildTarget,
  instrumentCwd,
}))
```

字段顺序通过 `json-stable-stringify` 固定，保证插件端与服务端结果一致。

## CI 自动检测

在 CI 环境中，插件会尝试自动填充配置：

| 环境 | provider | repoID | sha |
| --- | --- | --- | --- |
| GitLab CI | `gitlab` | `CI_PROJECT_ID` / `CI_PROJECT_PATH` | `CI_COMMIT_SHA` |
| GitHub Actions | `github` | `GITHUB_REPOSITORY_ID` / `GITHUB_REPOSITORY` | `GITHUB_SHA` |

检测到 `CI` / `GITLAB_CI` / `GITHUB_ACTIONS` 时，默认将 `ci` 设为 `true`，并写出 `.canyon_output`。

## 与产物的关系

- **运行时 coverage 对象**：注入 `buildHash`；默认移除 map 相关大字段
- **`.canyon_output/*.json`**：保留完整 map，并附带 `buildHash`、`provider`、`repoID`、`sha`、`buildTarget`、`instrumentCwd`

这样前端包体积更小，同时服务端仍能精确关联到某次 CI commit 的源码。

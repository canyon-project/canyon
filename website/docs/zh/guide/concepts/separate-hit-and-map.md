---
description: 在 AST 插桩阶段分离 hit 与 map，降低产物体积并提前上传静态覆盖率结构。
---

# 分离 Hit 与 Map

Istanbul 风格的覆盖率数据通常包含两类信息：

| 类型 | 内容 | 何时产生 |
| --- | --- | --- |
| **Map** | `statementMap` / `fnMap` / `branchMap` / `inputSourceMap` 等静态结构 | 编译期即可确定 |
| **Hit** | `s` / `f` / `b` 等命中计数 | 运行时随执行累加 |

Canyon 在 CI 的 AST 插桩阶段把两者拆开。

## 做法

`@canyonjs/babel-plugin` 在 Istanbul 插桩之后：

1. 从 AST 中提取完整 `coverageData`（含 map）
2. 当 `ci: true` 时写入 `.canyon_output/coverage-final-init-*.json`
3. 默认 `keepMap: false` 时，从产物里的 `coverageData` 删除：
   - `statementMap`
   - `fnMap`
   - `branchMap`
   - `inputSourceMap`
   - `hash`
   - `_coverageSchema`
4. 写入 `buildHash`，供采集端关联

## 收益

- **产物更小**：浏览器包不再携带大段 map
- **传输更轻**：UI 自动化 / 人工测试只需上报 hit
- **提前落库**：map 在 CI 上传，避免测试高峰冲垮带宽（相对全量上报通常可减少绝大部分流量）

## CI 上报 Map

```yaml
script:
  - npm run build
  - npx @canyonjs/cli upload --dsn=https://app.canyonjs.io/api/coverage/map/init
```

## 何时保留 Map

若本地调试需要完整 Istanbul 对象，可设置 `keepMap: true`。生产 / CI 采集路径建议保持默认 `false`。

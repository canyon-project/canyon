---
description: Canyon 接受 V8 与 Istanbul.js 类型的覆盖率数据。
---

# 数据格式

Canyon 在采集与入库链路中可接受两类常见覆盖率输入：

## Istanbul.js

Istanbul 覆盖率对象通常包含：

```js
{
  path: 'src/app.ts',
  statementMap: { /* ... */ },
  fnMap: { /* ... */ },
  branchMap: { /* ... */ },
  s: { '0': 1, '1': 0 },
  f: { '0': 1 },
  b: { '0': [1, 0] },
  // Canyon 扩展：
  buildHash: '...'
}
```

Babel 插桩路径（`babel-plugin-istanbul` + `@canyonjs/babel-plugin`）默认产出 Istanbul 结构。Hit/Map 分离后，运行时对象主要保留 `s` / `f` / `b` 与 `buildHash`。

## V8

V8 覆盖率（如 Node / Chromium 的 `Profiler.takePreciseCoverage`）以函数与字节范围描述命中情况。Canyon 接受 V8 类型数据，并在服务端侧纳入与 Istanbul 统一的关联 / 聚合流程（通过 `buildHash`、scene 等元数据对齐到同一构建）。

## 选型建议

| 场景 | 建议 |
| --- | --- |
| 前端 Babel / Vite / Webpack 插桩 | Istanbul（插件生态最完整） |
| Node / 原生 V8 采集 | 直接上报 V8，或先转换再入库 |
| 混合栈 | 统一附带 `buildHash` 与 scene，由服务端归一 |

无论输入格式如何，**CI commit 关联** 与 **scene 分场景** 的语义保持一致。

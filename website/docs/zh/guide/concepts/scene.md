---
description: 使用 scene key/value 对覆盖率数据进行分场景归类，实现按用例查看覆盖。
---

# Scene 分场景

在采集阶段，Canyon 通过 **scene**（一组 key/value）把不同用例 / 场景产生的 hit 分门别类。结合 `buildHash`，服务端可以知道：

- 这批 hit 属于哪次 CI 构建（哪份源码 / map）
- 这批 hit 属于哪个测试场景

## 为什么需要 Scene

E2E / UI 自动化往往同时跑大量 case。若只累加全局覆盖率，很难回答：

- 某个失败 case 实际走到了哪些分支？
- 某条业务路径是否从未被自动化覆盖？

Scene 让覆盖率可以按「用例维度」存储与查询。

## 如何声明

采集脚本侧通过全局配置传入 scene：

```html
<script>
  window.CANYON_DSN = 'https://app.canyonjs.io/api/coverage/client';
  window.CANYON_SCENE = {
    suite: 'checkout',
    caseId: 'pay-success',
    browser: 'chromium',
  };
</script>
```

也可以在自动化框架里按 case 切换 scene（例如 Playwright 的 `beforeEach`），保证每个 case 上报时带上自己的标签。

## 与 buildHash 的关系

| 字段 | 作用 |
| --- | --- |
| `buildHash` | 定位源码版本与 map |
| `scene` | 定位用例 / 场景维度 |

两者正交：同一构建下可以有许多 scene；同一 scene 标签也可能跨多次构建出现（对比时再按 buildHash 区分）。

## Scene Hash

服务端会对 scene 的 key/value 做稳定哈希，得到 **scene hash**，用于索引与后续 [聚合](/guide/concepts/aggregation)。相同 scene 内容会得到相同 hash，便于归并。

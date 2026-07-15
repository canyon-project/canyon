---
description: Canyon 是面向 E2E / UI 自动化的 JavaScript 代码覆盖率解决方案。
---

# 介绍

Canyon 是一个 **JavaScript 代码覆盖率解决方案**，专注解决开发与 QA 在端到端（E2E）、UI 自动化场景下需要**按测试用例**查看覆盖率的痛点。

## 它解决什么问题

传统 Istanbul / V8 覆盖率方案通常假设「测试与源码在同一仓库、同一进程」。前端 E2E 场景则常见：

- 构建产物与测试仓库分离，运行时难以映射回源码
- UI 自动化产生海量覆盖率命中数据，传输与存储压力大
- 需要按 case / 场景维度查看覆盖，而不是一次跑完再看总量

Canyon 通过 **CI 阶段绑定 commit**、**Hit/Map 分离**、**buildHash 关联**、**Scene 分场景采集** 与 **Scene Hash 聚合**，把覆盖率采集做成可扩展的平台能力。

## 核心能力

| 能力 | 说明 |
| --- | --- |
| CI ↔ Commit | 在 CI 构建时关联当前 commit id 与 JS 源码 |
| Hit / Map 分离 | AST 插桩时剥离 map，降低产物体积 |
| buildHash | 用构建身份串联 map、hit 与源码版本 |
| Scene | 以 key/value 归类不同 case 的覆盖率 |
| 聚合收敛 | 生成报告前按 scene hash 聚合，加速下次生成 |
| 多格式 | 接受 V8、Istanbul.js 类型数据 |

## 组成

Canyon 主要由三部分构成：

- **插件层**（如 [`@canyonjs/babel-plugin`](/guide/ecosystem/babel-plugin)）：在 CI 构建阶段完成插桩、写入初始 map、注入 `buildHash`
- **采集层**：运行时只上报 hit，并附带 scene 与 buildHash
- **服务端 / 报告层**：按 buildHash 还原源码与 map，聚合 scene，生成覆盖率产物

## 下一步

- 了解 [整体架构](/guide/concepts/architecture)
- 按 [快速开始](/guide/start/getting-started) 完成首次插桩与上报
- 查阅 [Babel Plugin API](/api/babel-plugin)

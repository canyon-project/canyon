---
pageType: home

hero:
  name: Canyon
  text: PR / MR 覆盖率闭环
  tagline: 在 CI 中完成 map 初始化、命中上报、快照生成与轮询，拿到源码级覆盖率概览后回写检查状态。
  actions:
    - theme: brand
      text: CI 集成指南
      link: /guide/ci/overview
    - theme: alt
      text: 概念说明
      link: /guide/start/concepts
features:
  - title: Map / Hit 分离
    details: 构建期写入语句地图与 sourcemap；测试期只上报命中。相同文件内容可跨 SHA 复用。
    icon: 🗺️
    link: /guide/start/concepts
  - title: Tag 多场景
    details: 用 source / type / env / trigger 区分 e2e、unit、环境等场景，快照可按 tag 筛选聚合。
    icon: 🏷️
    link: /guide/ci/overview
  - title: 异步快照
    details: 压缩 hit → 组装 map → source map 回溯源码 → 落库。任务有状态，适合 CI 轮询。
    icon: 📸
    link: /guide/ci/overview
  - title: API 清晰
    details: init / client / snapshot / 任务查询，接口字段与请求示例齐全。
    icon: 🔌
    link: /guide/api/coverage
---

---
description: Canyon — JavaScript 代码覆盖率解决方案，面向 E2E / UI 自动化的按用例覆盖率采集平台。
pageType: home

hero:
  name: Canyon
  text: JavaScript 代码覆盖率解决方案
  tagline: CI 关联 Commit · Hit/Map 分离 · Scene 分场景采集 · 支持 V8 / Istanbul
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/start/introduction
    - theme: alt
      text: GitHub
      link: https://github.com/canyon-project/canyon
  image:
    src: /rspress-icon.png
    alt: Canyon Logo
features:
  - title: CI 与 Commit 关联
    details: 在 CI 阶段将当前 commit id 与 JS 源码绑定，通过 buildHash 贯穿插桩、采集与报告全链路。
    icon: 🔗
    link: /guide/concepts/build-hash
  - title: Hit / Map 分离
    details: AST 插桩时剥离 map，产物只保留 hit，显著降低体积与传输成本。
    icon: 📦
    link: /guide/concepts/separate-hit-and-map
  - title: Scene 分场景
    details: 以 scene key/value 归类各 case 产生的覆盖率，按用例维度查看覆盖情况。
    icon: 🎯
    link: /guide/concepts/scene
  - title: Scene Hash 聚合
    details: 生成报告前聚合相同 scene hash，收敛数据体量，加速后续生成。
    icon: ⚡
    link: /guide/concepts/aggregation
  - title: 多格式兼容
    details: 同时接受 V8 与 Istanbul.js 类型的覆盖率数据。
    icon: 🧩
    link: /guide/concepts/data-formats
  - title: 构建插件生态
    details: 提供 @canyonjs/babel-plugin 等插件，与 Istanbul 工具链无缝协作。
    icon: 🛠
    link: /guide/ecosystem/babel-plugin
---

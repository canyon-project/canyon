---
description: Canyon is a JavaScript code coverage solution for per-test-case coverage in E2E and UI automation.
pageType: home

hero:
  name: Canyon
  text: JavaScript Code Coverage Solution
  tagline: CI Commit Binding · Hit/Map Separation · Scene Collection · V8 / Istanbul
  actions:
    - theme: brand
      text: Quick Start
      link: /en/guide/start/introduction
    - theme: alt
      text: GitHub
      link: https://github.com/canyon-project/canyon
  image:
    src: /rspress-icon.png
    alt: Canyon Logo
features:
  - title: CI & Commit Binding
    details: Bind the CI commit id to JS source at build time, and carry buildHash through instrumentation, collection, and reporting.
    icon: 🔗
    link: /en/guide/concepts/build-hash
  - title: Hit / Map Separation
    details: Strip maps during AST instrumentation so the runtime payload only keeps hits — smaller bundles and cheaper uploads.
    icon: 📦
    link: /en/guide/concepts/separate-hit-and-map
  - title: Scene Grouping
    details: Categorize coverage by scene key/value pairs so you can inspect coverage per test case.
    icon: 🎯
    link: /en/guide/concepts/scene
  - title: Scene Hash Aggregation
    details: Aggregate identical scene hashes before report generation to shrink volume and speed up the next run.
    icon: ⚡
    link: /en/guide/concepts/aggregation
  - title: Multi-format Input
    details: Accept both V8 and Istanbul.js coverage data formats.
    icon: 🧩
    link: /en/guide/concepts/data-formats
  - title: Plugin Ecosystem
    details: Ship @canyonjs/babel-plugin and related tools that work with the Istanbul toolchain.
    icon: 🛠
    link: /en/guide/ecosystem/babel-plugin
---

---
pageType: home

hero:
  name: Canyon
  text: JavaScript coverage collection
  tagline: Instrument, collect, and store Istanbul coverage from CI and browser tests.
  actions:
    - theme: brand
      text: Quick Start
      link: /guide/start/introduction
    - theme: alt
      text: API Reference
      link: /api/
    - theme: alt
      text: GitHub
      link: https://github.com/canyon-project/canyon
  image:
    src: /rspress-icon.png
    alt: Canyon
features:
  - title: Two-step upload
    details: Initialize coverage maps at build time, then merge client hit data from tests and browsers.
    icon: 🧭
    link: /guide/start/workflow
  - title: Istanbul-compatible
    details: Works with Istanbul coverage objects, including statement, function, and branch hit maps.
    icon: 📦
    link: /api/map-init
  - title: Scene-aware hits
    details: Group runtime coverage by scene so the same build can accumulate hits from different test contexts.
    icon: 🎭
    link: /api/client
  - title: CI-ready
    details: Designed to run in GitHub Actions with Playwright, Babel instrumentation, and a local API server.
    icon: ⚙️
    link: /guide/start/example
  - title: HTTP API
    details: Simple JSON endpoints for health checks, map initialization, and client coverage uploads.
    icon: 🔌
    link: /api/
  - title: SQLite storage
    details: Coverage records, maps, source maps, and hits are stored with Prisma and SQLite.
    icon: 💾
    link: /api/data-model
---

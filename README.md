# Canyon [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/canyon-project/canyon/blob/main/LICENSE) [![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen?logo=github)](CODE_OF_CONDUCT.md) [![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/canyon-project/canyon) [![docker image size](https://img.shields.io/docker/image-size/zhangtao25/canyon/next)](https://hub.docker.com/r/zhangtao25/canyon) [![Made with Prisma](https://made-with.prisma.io/dark.svg)](https://prisma.io)

> [!WARNING]
> The `main` branch is currently in beta testing. For the stable branch, please use [`main-0128`](https://github.com/canyon-project/canyon/tree/main-0128)

👋 Canyon is a JavaScript code coverage solution

Video Showcase

[Bilibili](https://www.bilibili.com/video/BV13sXHYDEn6)
[YouTube](https://www.youtube.com/watch?v=-2IRQ_pmEjI)

![](./screenshots/coverage-report.jpg)

## Ecosystem

| Project               | Status                                                       | Description                                        |
|-----------------------|--------------------------------------------------------------|----------------------------------------------------|
| [babel-plugin-canyon] | [![babel-plugin-canyon-status]][babel-plugin-canyon-package] | Detecting environment variables in the pipeline    |
| [canyon-uploader]     | [![canyon-uploader-status]][canyon-uploader-package]         | Coverage data uploader                             |
| [canyon-extension]    | [![canyon-extension-status]][canyon-extension-package]       | Chrome plugin for coverage reporting of manual tests |

[babel-plugin-canyon]: https://github.com/canyon-project/canyon/tree/main/plugins/babel-plugin-canyon
[vite-plugin-canyon]: https://github.com/canyon-project/canyon/tree/main/plugins/vite-plugin-canyon
[swc-plugin-canyon]: https://github.com/canyon-project/canyon/tree/main/plugins/swc-plugin-canyon
[canyon-report]: https://github.com/canyon-project/canyon/tree/main/packages/canyon-report
[canyon-sdk]: https://github.com/canyon-project/canyon/tree/main/tools/canyon-sdk
[canyon-uploader]: https://github.com/canyon-project/canyon/tree/main/tools/canyon-uploader
[canyon-extension]: https://github.com/canyon-project/canyon/tree/main/tools/canyon-extension

[babel-plugin-canyon-status]: https://img.shields.io/npm/v/babel-plugin-canyon.svg
[vite-plugin-canyon-status]: https://img.shields.io/npm/v/vite-plugin-canyon.svg
[swc-plugin-canyon-status]: https://img.shields.io/npm/v/swc-plugin-canyon.svg
[canyon-report-status]: https://img.shields.io/npm/v/canyon-report.svg
[canyon-sdk-status]: https://img.shields.io/npm/v/canyon-sdk.svg
[canyon-uploader-status]: https://img.shields.io/npm/v/canyon-uploader.svg
[canyon-extension-status]: https://img.shields.io/chrome-web-store/v/omnpafdjidgpdmlimbangcjjaaodbeof.svg

[babel-plugin-canyon-package]: https://npmjs.com/package/babel-plugin-canyon
[vite-plugin-canyon-package]: https://npmjs.com/package/babel-plugin-canyon
[swc-plugin-canyon-package]: https://npmjs.com/package/babel-plugin-canyon
[canyon-report-package]: https://github.com/canyon-project/uploader/releases
[canyon-sdk-package]: https://github.com/canyon-project/uploader/releases
[canyon-uploader-package]: https://github.com/canyon-project/uploader/releases
[canyon-extension-package]: https://chrome.google.com/webstore/detail/canyon/omnpafdjidgpdmlimbangcjjaaodbeof



## Project Structure

Canyon (pronounced /ˈkænjən/) is a JavaScript code coverage collection platform. We address the difficulties developers and QA engineers encounter in collecting test case code coverage during end-to-end testing. It consists of three main parts:

- A series of plugin responsible for adapting to various CI tools and reading environment variables.

- An API service responsible for collecting and processing coverage data.

- A set of front-end and back-end services responsible for displaying coverage reports.


[Read the Docs to Learn More.](https://docs.canyonjs.io)

## Architecture

```mermaid
%%{init: {
  "theme": "base",
  "themeVariables": {
    "primaryColor": "#FFF7ED",
    "primaryBorderColor": "#FB923C",
    "lineColor": "#9CA3AF",
    "fontFamily": "Inter, system-ui"
  }
}}%%

flowchart LR
  classDef client fill:#EEF2FF,stroke:#6366F1,color:#1E1B4B;
  classDef test fill:#F1F5F9,stroke:#94A3B8,color:#020617;
  classDef core fill:#FFF7ED,stroke:#FB923C,color:#7C2D12;
  classDef storage fill:#ECFEFF,stroke:#06B6D4,color:#083344;
  classDef infra fill:#F0FDF4,stroke:#22C55E,color:#14532D;
  classDef external fill:#FAFAFA,stroke:#D1D5DB,color:#111827;

  %% Clients
  UI[UI Automation]
  WebUI[Canyon Web UI]
  API[API Client]

  class UI,WebUI,API client

  %% Test
  Test[Test Environment]
  Pipeline[CI / CD Pipeline]

  class Test,Pipeline test

  UI --> Test
  Pipeline --> Test

  %% Canyon Core
  subgraph Canyon["Canyon Server"]
    MQ[Message Queue]
    DB[(Postgres)]
    HTTP[HTTP / GraphQL Server]
  end

  class MQ,HTTP core
  class DB storage

  Test --> MQ
  MQ --> DB
  DB --> HTTP

  %% Infra
  subgraph Deploy["Service Deployment"]
    K8s[Kubernetes]
    Node[Node.js]
  end

  class K8s,Node infra

  Canyon --> Deploy

  %% External
  GitLab[GitLab]
  class GitLab external

  Canyon -.-> GitLab

  WebUI -.-> HTTP
  API -.-> HTTP

```

## WeChat Group

<img src="./screenshots/wechat59.jpg" style="width: 200px"/>

## Developing

Follow our [self-hosting documentation](https://docs.canyonjs.io/cn/docs/self-host/community-edition/prerequisites) to get started with the development environment.

## Contributing

Please contribute using [GitHub Flow](https://guides.github.com/introduction/flow). Create a branch, add commits, and [open a pull request](https://github.com/canyon-project/canyon/compare).

Please read [`CONTRIBUTING`](CONTRIBUTING.md) for details on our [`CODE OF CONDUCT`](CODE_OF_CONDUCT.md), and the process for submitting pull requests to us.


## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT) — see the [`LICENSE`](LICENSE) file for details.

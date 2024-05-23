# Canyon [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/canyon-project/canyon/blob/main/LICENSE) [![build status](https://github.com/canyon-project/canyon/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/canyon-project/canyon/actions/workflows/ci.yml) [![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen?logo=github)](CODE_OF_CONDUCT.md) [![Website](https://img.shields.io/website?url=https%3A%2F%2Fcanyoncov.com&logo=canyon)](https://canyoncov.com)

![](./screenshots/coverage-report.jpg)


> 👋 Canyon 是一个代码覆盖率解决方案。

**Bundling:** 多种生态的bundling方案。

- `vite` - vite-plugin-istanbul
- `babel` - babel-plugin-istanbul
- `swc` - swc-coverage-instrument

**React Native:** 支持React Native覆盖率数据收集。

**File:** 支持多种文件类型，例如js、jsx、ts、tsx。

**源码回溯:** 开启sourceMap选项来回溯源码覆盖率信息。

**CI** 提供覆盖率接口，方便CI工具集成。

**变更代码:** 通过配置想要对比的基线Commit Sha或者分支名，过滤筛选出变更代码文件的覆盖率以及计算出整体新增代码行覆盖率。

**报告组件:** 构建最小原生JavasScript的npm包，提供现代化前端报告水合方案以代替传统istanbul report。

**浏览器插件:** 提供浏览器插件，供开发人员实时检测应用覆盖率详情。

Canyon 是一个JavaScript代码覆盖率收集平台。我们解决了开发人员和 QA 工程师在端到端测试中遇到的测试用例代码覆盖率收集困难的问题。

- 一部分是适配各种流水线环境，提供了CI工具集成的覆盖率接口。

- 一部分是报告，负责处理展示覆盖率数据

## Contribution

See [Contributing Guide](CONTRIBUTING.md).

## License

[MIT](LICENSE).

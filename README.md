# Canyon [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/canyon-project/canyon/blob/main/LICENSE) [![build status](https://github.com/canyon-project/canyon/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/canyon-project/canyon/actions/workflows/ci.yml) [![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen?logo=github)](CODE_OF_CONDUCT.md)

👋 Canyon is a JavaScript code coverage solution

![](./screenshots/coverage-report.jpg)


## Features

**Bundling:** Support for various bundling ecosystems.

- `vite` - vite-plugin-istanbul
- `babel` - babel-plugin-istanbul
- `swc` - swc-coverage-instrument

**React Native:** Support for collecting coverage data in React Native.

**File:** Supports multiple file types, such as js, jsx, ts, and tsx.

**Source Traceback:** Enable the sourceMap option to trace back to the original source code coverage information.

**CI:** Provides coverage interfaces for easy integration with CI tools.

**Changed Code:** Configure the baseline commit SHA or branch name you want to compare, filter the coverage of changed files, and calculate the overall coverage of newly added lines.

**Reporting Component:** Build a minimal native JavaScript npm package, providing a modern frontend reporting hydration solution to replace traditional istanbul reports.

**Browser Plugin:** Provide a browser plugin for developers to detect application coverage details in real-time.

Canyon is a JavaScript code coverage collection platform. We address the difficulties developers and QA engineers encounter in collecting test case code coverage during end-to-end testing. It consists of three main parts:

- A Babel plugin responsible for adapting to various CI tools and reading environment variables.

- A backend service responsible for collecting and processing coverage data, and providing coverage reporting interfaces.

- A frontend service responsible for displaying coverage reports.


[Read the Docs to Learn More.](https://canyon-docs.netlify.app/overview/why-canyon)

## Architecture overview

![](./screenshots/architecture.png)

## WeChat Group

<img src="./screenshots/wechat1.jpg" style="width: 200px"/>

[//]: # (![]&#40;./screenshots/wechat.jpg&#41;)

## Contribution

See [Contributing Guide](CONTRIBUTING.md).

## License

[MIT](LICENSE).

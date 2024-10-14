# Canyon [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/canyon-project/canyon/blob/main/LICENSE) [![build status](https://github.com/canyon-project/canyon/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/canyon-project/canyon/actions/workflows/ci.yml) [![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen?logo=github)](CODE_OF_CONDUCT.md)

👋 Canyon is a JavaScript code coverage solution

![](./screenshots/coverage-report.jpg)

## Ecosystem

| Project               | Status                                                       | Description                                     |
| --------------------- | ------------------------------------------------------------ |-------------------------------------------------|
| [babel-plugin-canyon]          | [![babel-plugin-canyon-status]][babel-plugin-canyon-package]                   | Detecting environment variables in the pipeline |
| [canyon-uploader]                | [![uploader-status]][uploader-package]                               | Coverage data uploader          |
| [canyon-extension]             | [![canyon-extension-status]][canyon-extension-package]                         | Chrome plugin for coverage reporting of manual tests                           |

[babel-plugin-canyon]: https://github.com/canyon-project/babel-plugin-canyon
[uploader]: https://github.com/canyon-project/uploader
[canyon-extension]: https://github.com/canyon-project/canyon-extension
[babel-plugin-canyon-status]: https://img.shields.io/npm/v/babel-plugin-canyon.svg
[uploader-status]: https://img.shields.io/github/v/release/canyon-project/uploader?label=release
[canyon-extension-status]: https://img.shields.io/chrome-web-store/v/omnpafdjidgpdmlimbangcjjaaodbeof.svg
[babel-plugin-canyon-package]: https://npmjs.com/package/babel-plugin-canyon
[uploader-package]: https://github.com/canyon-project/uploader/releases
[canyon-extension-package]: https://chrome.google.com/webstore/detail/canyon/omnpafdjidgpdmlimbangcjjaaodbeof

## Project Structure

Canyon is a JavaScript code coverage collection platform. We address the difficulties developers and QA engineers encounter in collecting test case code coverage during end-to-end testing. It consists of three main parts:

- A Babel plugin responsible for adapting to various CI tools and reading environment variables.

- A backend service responsible for collecting and processing coverage data, and providing coverage reporting interfaces.

- A frontend service responsible for displaying coverage reports.


[Read the Docs to Learn More.](https://docs.canyonjs.org)

## Architecture

![](./screenshots/architecture.png)

## WeChat Group

<img src="./screenshots/wechat7.png" style="width: 200px"/>


## Contribution

See [Contributing Guide](CONTRIBUTING.md).

## License

[MIT](LICENSE).

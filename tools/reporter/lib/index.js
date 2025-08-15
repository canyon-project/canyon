const fs = require("fs");
const path = require("path");
const {generateHtml} = require("./template");
const {copyDirectory} = require("./utils");
const {generateDynamicData} = require("./dynamic-data");
const {generateFont} = require("./font");

class CoverageReport {
  constructor(options = {}) {
    this.cacheDirName = ".cache";
    this.constructorOptions = options;
    this.options = {
      ...options,
    };
    this.initOptions();
  }

  initOptions(force) {

  }

  async add(data) {
    const time_start = Date.now();
    this.initOptions();
    return {};
  }

  async generate({coverage,targetDir}) {
    this.initOptions();

    // 确保输出目录存在
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const cov = JSON.stringify(coverage);
    // 动态数据写到 targetDir/dynamic-data 下
    generateDynamicData({ coverage: cov, instrumentCwd: this.options.instrumentCwd || '', targetDir });

    // 生成 HTML
    const html = generateHtml({
      coverage: cov,
      reportName: this.options.reportName || 'All files',
      instrumentCwd: this.options.instrumentCwd || '',
      date: new Date().toLocaleString(),
    });
    fs.writeFileSync(path.join(targetDir, 'index.html'), html);

    // 复制字体资源
    generateFont(targetDir);
    return {};
  }
}

const CCR = function (options) {
  return new CoverageReport(options);
};
module.exports = CCR;

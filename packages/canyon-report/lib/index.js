const fs = require("fs");
const path = require("path");
const {generateHtml} = require("./reports/template");
const {copyDirectory} = require("./utils");
const {generateDynamicData} = require("./reports/dynamic-data");

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
    console.log("initOptions");
  }

  async add(data) {
    const time_start = Date.now();
    this.initOptions();
    return {};
  }

  async generate() {
    this.initOptions();

    // 1. 获取当前工作目录，获取npm包中的dist目录
    const sourceDir = path.resolve(__dirname, "../dist");
    const targetDir = path.join(process.cwd(), "coverage");
    // 2. 获取coverage-final.json文件
    const covPath = path.join(process.cwd(), "coverage/coverage-final.json");
    const cov = (() => {
      try {
        return fs.readFileSync(covPath, "utf-8");
      } catch (e) {
        return '{}';
      }
    })()
    // 5. 核心，动态生成dynamic-data数据
    generateDynamicData({coverage: cov, instrumentCwd: this.options.instrumentCwd || ''});
    // 3. 复制dist目录到当前工作目录
    copyDirectory(sourceDir, targetDir);
    // 4. 生成html文件，注入coverage-final.json的数据，需要一个summary列表
    const html = generateHtml({
      coverage: cov,
      reportName: this.options.reportName || 'All files',
      instrumentCwd: this.options.instrumentCwd || '',
      date: new Date().toLocaleString(),
    });
    fs.writeFileSync(path.join(targetDir, "index.html"), html);
    return {};
  }
}

const CCR = function (options) {
  return new CoverageReport(options);
};
module.exports = CCR;

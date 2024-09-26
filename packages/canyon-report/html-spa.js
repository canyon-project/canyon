const { ReportBase } = require("istanbul-lib-report");
const CCR = require("./lib");
const fs = require("fs");
const path = require("path");
module.exports = class CustomReporter extends ReportBase {
  constructor(opts) {
    super();
    this.coverage = {};
  }

  onStart(root, context) {}

  onDetail(node, context) {
    const fileCoverage = node.getFileCoverage().toJSON();
    this.coverage[fileCoverage.path] = fileCoverage;
  }

  async onEnd() {
    const covPath = path.join(process.cwd(), "coverage/coverage-final.json");

    // 检查covPath是否存在，如果不存在则创建
    if (!fs.existsSync(path.dirname(covPath))) {
      fs.writeFileSync(covPath, JSON.stringify(this.coverage));
      // TODO 应该通过内存传过来
      console.log("新创建的");
    }

    const ccr = CCR({
      name: "My Coverage Report - 2024-02-28",
      outputDir: "./coverage-reports",
      reports: ["v8", "console-details"],
      cleanCache: true,
    });
    await ccr.add({});
    await ccr.generate();
  }
};

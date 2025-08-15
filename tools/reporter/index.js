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

  async onEnd(rootNode, context) {
    const ccr = CCR({
      instrumentCwd: process.cwd(),
      reportName: 'All files',
    });
    await ccr.add({});
    await ccr.generate({
      coverage: this.coverage,
      targetDir: context.dir
    });
  }
};

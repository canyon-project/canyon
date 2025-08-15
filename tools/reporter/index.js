const { ReportBase } = require('istanbul-lib-report');
const CCR = require('./lib');
const _fs = require('fs');
const _path = require('path');
module.exports = class CustomReporter extends ReportBase {
  constructor(_opts) {
    super();
    this.coverage = {};
  }

  onStart(_root, _context) {}

  onDetail(node, _context) {
    const fileCoverage = node.getFileCoverage().toJSON();
    this.coverage[fileCoverage.path] = fileCoverage;
  }

  async onEnd(_rootNode, context) {
    const ccr = CCR({
      instrumentCwd: process.cwd(),
      reportName: 'All files',
    });
    await ccr.add({});
    await ccr.generate({
      coverage: this.coverage,
      targetDir: context.dir,
    });
  }
};

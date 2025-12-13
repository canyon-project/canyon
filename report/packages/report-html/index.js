const { ReportBase } = require('istanbul-lib-report');
const CR = require('./lib');
module.exports = class CustomReporter extends ReportBase {
  constructor() {
    super();
    this.coverage = {};
  }

  onStart(_root, _context) {}

  onDetail(node) {
    const fileCoverage = node.getFileCoverage().toJSON();
    this.coverage[fileCoverage.path] = fileCoverage;
  }

  async onEnd(_rootNode, context) {
    const cr = CR();
    await cr.generate({
      coverage: this.coverage,
      targetDir: context.dir,
    });
  }
};

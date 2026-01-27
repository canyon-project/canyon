const { ReportBase } = require('istanbul-lib-report');
const fs = require('node:fs');
const path = require('node:path');
const CR = require('./lib');
module.exports = class CustomReporter extends ReportBase {
  constructor(reportConfig) {
    super();
    this.coverage = {};
    this.reportConfig = reportConfig || {};
  }

  onStart(_root, _context) {
  }

  onDetail(node) {
    const fileCoverage = node.getFileCoverage().toJSON();
    this.coverage[fileCoverage.path] = fileCoverage;
  }

  async onEnd(_rootNode, context) {
    // 如果 reportConfig.diff 不存在，尝试从当前工作目录读取 diff.txt
    if (!this.reportConfig.diff) {
      const diffFilePath = path.resolve(process.cwd(), 'diff.txt');
      if (fs.existsSync(diffFilePath)) {
        try {
          const diffContent = fs.readFileSync(diffFilePath, 'utf-8');
          this.reportConfig.diff = diffContent;
        } catch (error) {
        }
      } else {
        console.log('diff.txt file not found at: %s', diffFilePath);
      }
    }

    const cr = CR();
    const result = await cr.generate({
      coverage: this.coverage,
      targetDir: context.dir,
      sourceFinder: context.sourceFinder,
      reportConfig: this.reportConfig,
    });

    console.log(
      'Report generation completed successfully. Report path: %s',
      result.reportPath,
    );
  }
};

const { ReportBase } = require('istanbul-lib-report');
const fs = require('node:fs');
const path = require('node:path');
const debug = require('debug')('canyon:report-html');
const CR = require('./lib');
module.exports = class CustomReporter extends ReportBase {
  constructor(reportConfig) {
    super();
    this.coverage = {};
    this.reportConfig = reportConfig || {};
    debug('CustomReporter initialized with config: %o', this.reportConfig);
    debug('Diff configuration: %o', this.reportConfig.diff);
  }

  onStart(_root, _context) {
    debug('Report generation started');
  }

  onDetail(node) {
    const fileCoverage = node.getFileCoverage().toJSON();
    debug('Processing file coverage for: %s', fileCoverage.path);
    debug(
      'File coverage stats - statements: %d, functions: %d, branches: %d, lines: %d',
      Object.keys(fileCoverage.s || {}).length,
      Object.keys(fileCoverage.f || {}).length,
      Object.keys(fileCoverage.b || {}).length,
      fileCoverage.source ? fileCoverage.source.split('\n').length : 0,
    );
    this.coverage[fileCoverage.path] = fileCoverage;
  }

  async onEnd(_rootNode, context) {
    debug(
      'Report generation ending. Processing %d files',
      Object.keys(this.coverage).length,
    );
    debug('Target directory: %s', context.dir);
    debug('Coverage files: %o', Object.keys(this.coverage));

    // 如果 reportConfig.diff 不存在，尝试从当前工作目录读取 diff.txt
    if (!this.reportConfig.diff) {
      const diffFilePath = path.resolve(process.cwd(), 'diff.txt');
      if (fs.existsSync(diffFilePath)) {
        debug('Reading diff from file: %s', diffFilePath);
        try {
          const diffContent = fs.readFileSync(diffFilePath, 'utf-8');
          this.reportConfig.diff = diffContent;
          debug(
            'Successfully read diff file, size: %d bytes',
            diffContent.length,
          );
        } catch (error) {
          debug('Failed to read diff.txt file: %o', error);
        }
      } else {
        debug('diff.txt file not found at: %s', diffFilePath);
      }
    }

    const cr = CR();
    const result = await cr.generate({
      coverage: this.coverage,
      targetDir: context.dir,
      sourceFinder: context.sourceFinder,
      reportConfig: this.reportConfig,
    });

    debug(
      'Report generation completed successfully. Report path: %s',
      result.reportPath,
    );
  }
};

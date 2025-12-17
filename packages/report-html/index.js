const { ReportBase } = require('istanbul-lib-report');
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

    const cr = CR();
    const result = await cr.generate({
      coverage: this.coverage,
      targetDir: context.dir,
      sourceFinder: context.sourceFinder,
    });

    debug(
      'Report generation completed successfully. Report path: %s',
      result.reportPath,
    );
  }
};

const fs = require('node:fs');
const path = require('node:path');
const debug = require('debug')('canyon:report-html');
const { compress } = require('./compress');
const parseDiff = require('parse-diff');

class CoverageReport {
  constructor(options = {}) {
    debug('Creating CoverageReport instance with options:', options);
    this.options = {
      ...options,
    };
    this.initOptions();
  }

  initOptions() {}

  copyDistToTarget(sourceDir, targetDir) {
    debug('Copying dist files from %s to %s', sourceDir, targetDir);
    // 确保目标目录存在
    if (!fs.existsSync(targetDir)) {
      debug('Creating target directory: %s', targetDir);
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // 读取源目录中的所有文件和文件夹
    const items = fs.readdirSync(sourceDir);
    debug('Found %d items to copy: %o', items.length, items);

    items.forEach((item) => {
      const sourcePath = path.join(sourceDir, item);
      const targetPath = path.join(targetDir, item);

      const stat = fs.statSync(sourcePath);

      if (stat.isDirectory()) {
        // 递归复制子目录
        debug('Copying directory: %s', item);
        this.copyDistToTarget(sourcePath, targetPath);
      } else {
        // 复制文件
        debug('Copying file: %s', item);
        fs.copyFileSync(sourcePath, targetPath);
      }
    });
  }

  buildReportData(coverage, gitDiffData = {}, sourceFinder) {
    debug('Building report data for %d files', Object.keys(coverage).length);
    debug('Git diff data keys: %o', Object.keys(gitDiffData));
    // 计算总体统计信息
    const summary = {};

    // 构建文件数组
    const files = Object.keys(coverage).map((filePath) => {
      const fileData = coverage[filePath];

      // 读取源文件内容
      const source = fileData.source || sourceFinder(filePath);

      return {
        source,
        path: filePath,
        statementMap: fileData.statementMap || {},
        fnMap: fileData.fnMap || {},
        branchMap: fileData.branchMap || {},
        s: fileData.s || {},
        f: fileData.f || {},
        b: fileData.b || {},
        changedLines: [], // 添加变更行号信息
      };
    });

    const reportData = {
      instrumentCwd: process.cwd(),
      type: 'v8',
      reportPath: 'coverage/index.html',
      version: '2.12.9',
      watermarks: {
        bytes: [50, 80],
        statements: [50, 80],
        branches: [50, 80],
        functions: [50, 80],
        lines: [50, 80],
      },
      summary,
      files,
    };

    debug(
      'Built report data with %d files, instrumentCwd: %s',
      files.length,
      reportData.instrumentCwd,
    );
    return reportData;
  }
  diffFn(diff = '') {
    const files = parseDiff(diff);
    console.log('number of patched files', files.length); // number of patched files
    files.forEach((file) => {
      const c = {
        path: file.to,
        changes: {
          additions: [],
          deletions: [],
        },
      };
      file.chunks.forEach((chunk) => {
        chunk.changes.forEach((change) => {
          if (change.type === 'add') {
            c.changes.additions.push(change.ln);
          }
          if (change.type === 'del') {
            c.changes.deletions.push(change.ln);
          }
        });
      });
      console.log(c);
    });
  }
  async generate({ coverage, targetDir, sourceFinder, reportConfig }) {
    this.diffFn(reportConfig?.diff);

    debug('Starting report generation to target directory: %s', targetDir);
    this.initOptions();

    // 构建报告数据
    const reportData = this.buildReportData(coverage, {}, sourceFinder);

    // 复制dist文件夹内容到targetDir
    const sourceDir = path.resolve(__dirname, '../dist');
    debug('Source dist directory: %s', sourceDir);
    if (fs.existsSync(sourceDir)) {
      debug('Source dist directory exists, copying to target');
      this.copyDistToTarget(sourceDir, targetDir);
    } else {
      debug('Source dist directory does not exist: %s', sourceDir);
    }

    // 生成 report-data.js 文件
    const reportDataContent = `window.reportData = '${compress(JSON.stringify(reportData))}';`;
    const reportDataPath = path.join(targetDir, 'data/report-data.js');
    debug(
      'Writing report data to: %s (compressed size: %d bytes)',
      reportDataPath,
      reportDataContent.length,
    );
    fs.writeFileSync(reportDataPath, reportDataContent, 'utf8');

    const result = {
      reportPath: path.join(targetDir, 'index.html'),
      reportData,
    };

    debug('Report generation completed. Report path: %s', result.reportPath);
    return result;
  }
}

const CR = (options) => new CoverageReport(options);
module.exports = CR;

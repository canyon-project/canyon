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

  /**
   * 匹配文件路径，处理相对路径和绝对路径的差异
   * @param {string} coveragePath - coverage 中的文件路径
   * @param {Object} diffMap - diff 映射表
   * @returns {Object} 匹配到的 diff 数据
   */
  matchFileDiff(coveragePath, diffMap) {
    // 直接匹配
    if (diffMap[coveragePath]) {
      return diffMap[coveragePath];
    }

    // 尝试规范化路径后匹配
    const normalizedCoveragePath = path
      .normalize(coveragePath)
      .replace(/\\/g, '/');
    for (const [diffPath, diffData] of Object.entries(diffMap)) {
      const normalizedDiffPath = path.normalize(diffPath).replace(/\\/g, '/');

      // 完全匹配
      if (normalizedCoveragePath === normalizedDiffPath) {
        return diffData;
      }

      // 文件名匹配（处理路径前缀不同的情况）
      // if (
      //   normalizedCoveragePath.endsWith(normalizedDiffPath) ||
      //   normalizedDiffPath.endsWith(normalizedCoveragePath)
      // ) {
      //   return diffData;
      // }

      // 只比较文件名
      const coverageBasename = path.basename(normalizedCoveragePath);
      const diffBasename = path.basename(normalizedDiffPath);
      if (coverageBasename === diffBasename && coverageBasename) {
        debug('Matched file by basename: %s <-> %s', coveragePath, diffPath);
        return diffData;
      }
    }

    return null;
  }

  buildReportData(coverage, diffMap = {}, sourceFinder) {
    debug('data for %d files', Object.keys(coverage).length);
    debug('Diff map keys: %o', Object.keys(diffMap));
    // 计算总体统计信息
    const summary = {};

    // 构建文件数组
    const files = Object.keys(coverage).map((filePath) => {
      const fileData = coverage[filePath];

      // 读取源文件内容
      const source = fileData.source || sourceFinder(filePath);

      // 获取该文件的变更行号（尝试匹配路径）
      const fileDiff = this.matchFileDiff(filePath, diffMap) || {};
      const addLines = fileDiff.additions || [];
      const delLines = fileDiff.deletions || [];
      const changedLines = [...new Set([...addLines, ...delLines])].sort(
        (a, b) => a - b,
      );

      // 计算变更覆盖率
      const changedCoverage = this.calculateChangedCoverage(fileData, addLines);

      return {
        source,
        path: filePath,
        statementMap: fileData.statementMap || {},
        fnMap: fileData.fnMap || {},
        branchMap: fileData.branchMap || {},
        s: fileData.s || {},
        f: fileData.f || {},
        b: fileData.b || {},
        changedLines, // 变更行号信息（包括新增和删除），用于显示
        diff: {
          additions: addLines,
          deletions: delLines,
        }, // diff 信息，用于 CoverageDetail 组件
        changestatements: changedCoverage, // 变更代码的语句覆盖率统计
      };
    });

    const reportData = {
      instrumentCwd: process.cwd(),
      type: 'v8',
      reportPath: 'coverage/index.html',
      version: '2.12.9',
      generatedAt: new Date().toISOString(),
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
    if (!diff) {
      return {};
    }
    const parsedFiles = parseDiff(diff);
    debug('Parsed %d files from diff', parsedFiles.length);

    // 构建文件路径到变更行号的映射
    const diffMap = {};

    parsedFiles.forEach((file) => {
      const filePath = file.to;
      if (!filePath) return;

      const additions = [];
      const deletions = [];

      file.chunks.forEach((chunk) => {
        chunk.changes.forEach((change) => {
          if (change.type === 'add') {
            additions.push(change.ln);
          }
          if (change.type === 'del') {
            deletions.push(change.ln);
          }
        });
      });

      if (additions.length > 0 || deletions.length > 0) {
        diffMap[filePath] = {
          additions,
          deletions,
        };
        debug(
          'File %s: %d additions, %d deletions',
          filePath,
          additions.length,
          deletions.length,
        );
      }
    });

    return diffMap;
  }

  /**
   * 计算变更代码的覆盖率
   * @param {Object} fileData - 文件覆盖率数据
   * @param {Array<number>} addLines - 新增的行号数组
   * @returns {Object} 变更覆盖率统计信息
   */
  calculateChangedCoverage(fileData, addLines) {
    if (!addLines || addLines.length === 0) {
      return {
        total: 0,
        covered: 0,
        pct: 100,
      };
    }

    if (!fileData.s || !fileData.statementMap) {
      return {
        total: 0,
        covered: 0,
        pct: 100,
      };
    }

    const addedLinesSet = new Set(addLines);
    const relatedStatements = [];

    // 找到与变更行相关的语句
    Object.entries(fileData.statementMap).forEach(([stId, meta]) => {
      const startLine = meta.start.line;
      const endLine = meta.end.line;

      // 检查语句是否与变更行相交
      for (let line = startLine; line <= endLine; line++) {
        if (addedLinesSet.has(line)) {
          const count = fileData.s[stId] || 0;
          const covered = count > 0;
          relatedStatements.push({
            stId,
            covered,
            count,
          });
          break; // 找到交集就跳出
        }
      }
    });

    const total = relatedStatements.length;
    const covered = relatedStatements.filter((s) => s.covered).length;
    const pct = total > 0 ? Math.round((covered / total) * 100) : 100;

    return {
      total,
      covered,
      pct,
    };
  }
  async generate({ coverage, targetDir, sourceFinder, reportConfig }) {
    // 解析 diff 数据
    const diffMap = this.diffFn(reportConfig?.diff || '');

    debug('Starting report generation to target directory: %s', targetDir);
    this.initOptions();

    // 构建报告数据，传入 diff 映射
    const reportData = this.buildReportData(coverage, diffMap, sourceFinder);
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

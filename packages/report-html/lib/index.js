const fs = require('node:fs');
const path = require('node:path');
const { compress } = require('./compress');
const parseDiff = require('parse-diff');

class CoverageReport {
  constructor(options = {}) {
    this.options = {
      ...options,
    };
    this.initOptions();
  }

  initOptions() {}

  copyDistToTarget(sourceDir, targetDir) {
    // 确保目标目录存在
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // 读取源目录中的所有文件和文件夹
    const items = fs.readdirSync(sourceDir);
    items.forEach((item) => {
      const sourcePath = path.join(sourceDir, item);
      const targetPath = path.join(targetDir, item);

      const stat = fs.statSync(sourcePath);

      if (stat.isDirectory()) {
        // 递归复制子目录
        this.copyDistToTarget(sourcePath, targetPath);
      } else {
        // 复制文件
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
    const base = process.cwd();
    const relativePath = path.relative(base, coveragePath);
    return diffMap[relativePath] || null;
  }

  buildReportData(coverage, diffMap = {}, sourceFinder) {
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

    return reportData;
  }
  diffFn(diff = '') {
    if (!diff) {
      return {};
    }
    const parsedFiles = parseDiff(diff);

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

    this.initOptions();

    // 构建报告数据，传入 diff 映射
    const reportData = this.buildReportData(coverage, diffMap, sourceFinder);
    // 复制dist文件夹内容到targetDir
    const sourceDir = path.resolve(__dirname, '../dist');
    if (fs.existsSync(sourceDir)) {
      this.copyDistToTarget(sourceDir, targetDir);
    } else {
    }

    // 生成 report-data.js 文件
    const reportDataContent = `window.reportData = '${compress(JSON.stringify(reportData))}';`;
    const reportDataPath = path.join(targetDir, 'data/report-data.js');
    fs.writeFileSync(reportDataPath, reportDataContent, 'utf8');

    const result = {
      reportPath: path.join(targetDir, 'index.html'),
      reportData,
    };
    return result;
  }
}

const CR = (options) => new CoverageReport(options);
module.exports = CR;

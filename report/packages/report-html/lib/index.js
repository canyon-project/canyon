const fs = require('node:fs');
const path = require('node:path');
const {compress} = require("./compress");

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

  buildReportData(coverage, gitDiffData = {}) {
    // 计算总体统计信息
    const summary = {};

    // 构建文件数组
    const files = Object.keys(coverage).map((filePath) => {
      const fileData = coverage[filePath];

      // 读取源文件内容
      let source = fileData.source || '';
      if (!source && fs.existsSync(filePath)) {
        try {
          source = fs.readFileSync(filePath, 'utf8');
        } catch (error) {
          console.warn(`无法读取文件 ${filePath}:`, error.message);
          source = '';
        }
      }

      // 查找匹配的 git diff 数据，使用 endsWith 匹配路径
      let changedLines = [];
      for (const [gitPath, lines] of Object.entries(gitDiffData)) {
        if (filePath.endsWith(gitPath)) {
          changedLines = lines;
          break;
        }
      }

      return {
        source,
        path: filePath,
        statementMap: fileData.statementMap || {},
        fnMap: fileData.fnMap || {},
        branchMap: fileData.branchMap || {},
        s: fileData.s || {},
        f: fileData.f || {},
        b: fileData.b || {},
        changedLines, // 添加变更行号信息
      };
    });

    return {
      instrumentCwd:process.cwd(),
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
  }
  async generate({ coverage, targetDir }) {
    // console.log(targetDir,__dirname,process.cwd())
    this.initOptions();

    // const _cov = JSON.stringify(coverage);

    // 读取 git diff 数据
    let gitDiffData = {};
    const gitDiffPath = path.join(process.cwd(), 'canyonjs-git-diff.json');
    if (fs.existsSync(gitDiffPath)) {
      try {
        const gitDiffContent = fs.readFileSync(gitDiffPath, 'utf8');
        gitDiffData = JSON.parse(gitDiffContent);
        console.log('成功读取 git diff 数据，包含', Object.keys(gitDiffData).length, '个文件的变更信息');
      } catch (error) {
        console.warn('读取 canyonjs-git-diff.json 失败:', error.message);
      }
    } else {
      console.log('未找到 canyonjs-git-diff.json 文件');
    }

    // 构建报告数据
    const reportData = this.buildReportData(coverage, gitDiffData);

    // 复制dist文件夹内容到targetDir
    const sourceDir = path.resolve(__dirname, '../dist');
    if (fs.existsSync(sourceDir)) {
      this.copyDistToTarget(sourceDir, targetDir);
    }

    // 生成 report-data.js 文件
    const reportDataContent = `window.reportData = '${compress(JSON.stringify(reportData))}';`;
    const reportDataPath = path.join(targetDir, 'report-data.js');
    fs.writeFileSync(reportDataPath, reportDataContent, 'utf8');

    return {
      reportPath: path.join(targetDir, 'index.html'),
      reportData,
    };
  }
}

const CR = (options) => new CoverageReport(options);
module.exports = CR;

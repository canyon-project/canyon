#!/usr/bin/env node
// 从 coverage/coverage-final.json 生成 HTML 覆盖率报告到 coverage/html

const fs = require('fs');
const path = require('path');
const libCoverage = require('istanbul-lib-coverage');
const libReport = require('istanbul-lib-report');
const reports = require('istanbul-reports');

const cwd = path.resolve(__dirname, '..');
const inFile = path.join(cwd, 'coverage', 'coverage-final.json');
const outDir = path.join(cwd, 'coverage', '');

if (!fs.existsSync(inFile)) {
  console.error('未找到合并后的覆盖率文件：', inFile);
  process.exit(1);
}

const json = JSON.parse(fs.readFileSync(inFile, 'utf8'));
const coverageMap = libCoverage.createCoverageMap(json);
const context = libReport.createContext({ dir: outDir, coverageMap });

// 生成 HTML 与简要文本汇总
reports.create('canyon-reporter', { skipEmpty: false, skipFull: false }).execute(context);
reports.create('text-summary').execute(context);

console.log('已生成 HTML 覆盖率报告：', outDir);



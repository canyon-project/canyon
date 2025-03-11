import fs from 'fs';
import path from 'path';

// 源文件路径
const sourceFile = path.join('dist', 'canyon-report.umd.cjs');
// 目标文件路径（修改扩展名为 .mjs）
const targetFile = path.join('dist', 'canyon-report.umd.js');

// 复制文件
fs.copyFile(sourceFile, targetFile, (err) => {
  if (err) {
    console.error('复制文件失败:', err);
  } else {
    console.log('canyon-report.umd.cjs -> canyon-report.umd.js');
  }
});

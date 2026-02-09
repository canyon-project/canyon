#!/usr/bin/env node

/**
 * 合并 frontend、backend、examples 和 packages/report 的覆盖率数据
 * 使用 nyc merge 命令合并覆盖率目录
 */

import { existsSync, readdirSync, mkdirSync, copyFileSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

// 覆盖率文件路径配置
const coveragePaths = [
  {
    name: 'frontend',
    path: join(rootDir, 'packages/frontend/coverage/coverage-final.json'),
  },
  {
    name: 'backend',
    path: join(rootDir, 'packages/backend/coverage/coverage-final.json'),
  },
  {
    name: 'report',
    path: join(rootDir, 'packages/report/coverage/coverage-final.json'),
  },
];

// 查找 examples 目录下的所有覆盖率文件
const examplesDir = join(rootDir, 'examples');
if (existsSync(examplesDir)) {
  const exampleDirs = readdirSync(examplesDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const exampleName of exampleDirs) {
    const coveragePath = join(
      examplesDir,
      exampleName,
      'coverage/coverage-final.json',
    );
    if (existsSync(coveragePath)) {
      coveragePaths.push({
        name: `examples-${exampleName}`,
        path: coveragePath,
      });
    }
  }
}

// 输出目录
const outputDir = join(rootDir, '.nyc_output');
const outputFile = join(outputDir, 'coverage-final.json');

console.log('📊 开始合并覆盖率数据...\n');

// 检查覆盖率文件是否存在
const existingCoverageFiles = coveragePaths.filter((item) =>
  existsSync(item.path),
);

if (existingCoverageFiles.length === 0) {
  console.error('❌ 未找到任何覆盖率文件');
  console.error('\n提示: 请先运行测试生成覆盖率文件');
  console.error('   pnpm run test');
  process.exit(1);
}

console.log(`找到 ${existingCoverageFiles.length} 个覆盖率文件:\n`);
existingCoverageFiles.forEach((item) => {
  console.log(`  ✓ ${item.name}: ${item.path}`);
});

// 创建临时目录并复制覆盖率文件
console.log(`\n🔄 准备合并覆盖率数据...\n`);

try {
  // 创建输出目录
  mkdirSync(outputDir, { recursive: true });

  // 复制覆盖率文件
  for (const item of existingCoverageFiles) {
    const targetPath = join(outputDir, `${item.name}.json`);
    copyFileSync(item.path, targetPath);
    console.log(`  ✓ 复制 ${item.name} -> ${targetPath}`);
  }
} catch (error) {
  console.error(`❌ 复制覆盖率文件失败: ${error.message}`);
  process.exit(1);
}

// 使用 nyc merge 合并覆盖率文件
console.log(`\n🔄 使用 nyc merge 合并覆盖率数据...\n`);

const nycProcess = spawn('npx', ['nyc', 'merge', outputDir, outputFile], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true,
});

nycProcess.on('close', (code) => {
  if (code === 0) {
    console.log(`\n✅ 覆盖率数据已合并到: ${outputFile}`);
    console.log(`   合并了 ${existingCoverageFiles.length} 个覆盖率文件\n`);
  } else {
    console.error(`\n❌ nyc merge 失败，退出码: ${code}`);
    process.exit(code || 1);
  }
});

nycProcess.on('error', (error) => {
  console.error(`\n❌ 执行 nyc merge 时出错: ${error.message}`);
  console.error('提示: 请确保已安装 nyc: pnpm add -D -w nyc');
  process.exit(1);
});

#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

/**
 * 自动更新 .idea/canyon.iml 文件，排除所有 coverage 文件夹
 */
function updateIdeaExcludes() {
  const imlPath = '.idea/canyon.iml';
  
  try {
    // 查找所有 coverage 文件夹
    const findCommand = 'find . -type d -name "coverage" -not -path "./node_modules/*" -not -path "./.git/*"';
    const coverageFolders = execSync(findCommand, { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(folder => folder.length > 0)
      .map(folder => folder.replace('./', ''));

    console.log('找到的 coverage 文件夹：');
    coverageFolders.forEach(folder => console.log(`  - ${folder}`));

    // 读取现有的 .iml 文件
    const imlContent = readFileSync(imlPath, 'utf8');
    
    // 解析现有的排除文件夹
    const existingExcludes = [];
    const excludeRegex = /<excludeFolder url="file:\/\/\$MODULE_DIR\$\/([^"]+)" \/>/g;
    let match;
    
    while ((match = excludeRegex.exec(imlContent)) !== null) {
      const folder = match[1];
      if (!folder.includes('coverage')) {
        existingExcludes.push(folder);
      }
    }

    // 生成新的排除列表
    const allExcludes = [
      ...existingExcludes,
      ...coverageFolders
    ].sort();

    // 生成新的排除 XML
    const excludeXml = allExcludes
      .map(folder => `      <excludeFolder url="file://$MODULE_DIR$/${folder}" />`)
      .join('\n');

    // 替换 content 部分
    const newContent = imlContent.replace(
      /<content url="file:\/\/\$MODULE_DIR\$">[\s\S]*?<\/content>/,
      `<content url="file://$MODULE_DIR$">
${excludeXml}
    </content>`
    );

    // 写入文件
    writeFileSync(imlPath, newContent, 'utf8');
    
    console.log(`\n✅ 已更新 ${imlPath}`);
    console.log(`📁 排除了 ${coverageFolders.length} 个 coverage 文件夹`);
    
  } catch (error) {
    console.error('❌ 更新失败：', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  updateIdeaExcludes();
}

export { updateIdeaExcludes };
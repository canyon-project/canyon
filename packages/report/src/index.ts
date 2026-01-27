import {ReportBase} from 'istanbul-lib-report'
import type {Tree, Context, Node} from 'istanbul-lib-report'
import * as fs from 'fs'
import * as path from 'path'
import {createRequire} from 'module'

const require = createRequire(import.meta.url)

function copyDistToTarget(sourceDir: string, targetDir: string): void {
  // 确保目标目录存在
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // 读取源目录中的所有文件和文件夹
  const items = fs.readdirSync(sourceDir);
  items.forEach((item: string) => {
    const sourcePath = path.join(sourceDir, item);
    const targetPath = path.join(targetDir, item);

    const stat = fs.statSync(sourcePath);

    if (stat.isDirectory()) {
      // 递归复制子目录
      copyDistToTarget(sourcePath, targetPath);
    } else {
      // 复制文件
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}

export default class CustomReporter extends ReportBase {
  constructor() {
    super();
  }

  onStart(_root: Tree, _context: Context): void {
  }

  onDetail(_node: Node): void {
    console.log('onDetail',_node)
  }

  async onEnd(_rootNode: Tree, _context: Context): Promise<void> {
    console.log('onEnd')
    
    // 读取 @canyonjs/report-html 包的 dist 目录
    try {
      const reportHtmlPath = require.resolve('@canyonjs/report-html');
      const reportHtmlDir = path.dirname(reportHtmlPath);
      const distDir = path.join(reportHtmlDir, 'dist');
      
      if (fs.existsSync(distDir)) {
        // 复制 dist 目录内容到 coverage 目录
        copyDistToTarget(distDir, _context.dir);
        console.log(`Successfully copied dist files from @canyonjs/report-html to ${_context.dir}`);
      } else {
        console.warn(`Dist directory not found at: ${distDir}`);
      }
    } catch (error) {
      console.error('Failed to copy dist files:', error);
    }
  }
};

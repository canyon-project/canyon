import * as fs from 'node:fs';
import * as path from 'node:path';
import type { FileCoverage } from 'istanbul-lib-coverage';
import type { Context, Node, Tree } from 'istanbul-lib-report';
import { ReportBase } from 'istanbul-lib-report';
import { CoverageReport } from './coverage-report';
import type { ReportConfig } from './types';

export default class CustomReporter extends ReportBase {
  private coverage: Record<string, FileCoverage> = {};
  private reportConfig: ReportConfig;

  constructor(reportConfig?: ReportConfig) {
    super();
    this.reportConfig = reportConfig || {};
  }

  onStart(_root: Tree, _context: Context): void {
    // 初始化方法，可以在这里做一些准备工作
  }

  onDetail(node: Node): void {
    const fileCoverage = node.getFileCoverage().toJSON();
    this.coverage[fileCoverage.path] = fileCoverage;
  }

  async onEnd(_rootNode: Tree, context: Context): Promise<void> {
    // 如果 reportConfig.diff 不存在，尝试从当前工作目录读取 diff.txt
    if (!this.reportConfig.diff) {
      const diffFilePath = path.resolve(process.cwd(), 'diff.txt');
      if (fs.existsSync(diffFilePath)) {
        try {
          const diffContent = fs.readFileSync(diffFilePath, 'utf-8');
          this.reportConfig.diff = diffContent;
        } catch (error) {
          // 忽略读取错误
        }
      } else {
        console.log('diff.txt file not found at: %s', diffFilePath);
      }
    }

    const cr = new CoverageReport();
    const result = await cr.generate({
      coverage: this.coverage,
      targetDir: context.dir,
      sourceFinder: context.sourceFinder,
      reportConfig: this.reportConfig,
    });

    console.log(
      'Report generation completed successfully. Report path: %s',
      result.reportPath,
    );
  }
}

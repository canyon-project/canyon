import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { genSummaryMapByCoverageMap, genSummaryTreeItem } from 'canyon-data';
import type { FileCoverage } from 'istanbul-lib-coverage';
import { createRequire } from 'module';
import parseDiff from 'parse-diff';
import { compress } from './compress';
import type {
  ChangedCoverage,
  DiffMap,
  FileReportData,
  GenerateOptions,
  GenerateResult,
  ReportData,
} from './types';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class CoverageReport {
  private options: Record<string, unknown> = {};

  constructor(options: Record<string, unknown> = {}) {
    this.options = { ...options };
    this.initOptions();
  }

  private initOptions(): void {
    // 初始化选项，可以在这里添加默认配置
  }

  private copyDistToTarget(sourceDir: string, targetDir: string): void {
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
        this.copyDistToTarget(sourcePath, targetPath);
      } else {
        // 复制文件
        fs.copyFileSync(sourcePath, targetPath);
      }
    });
  }

  /**
   * 匹配文件路径，处理相对路径和绝对路径的差异
   * @param coveragePath - coverage 中的文件路径
   * @param diffMap - diff 映射表
   * @returns 匹配到的 diff 数据
   */
  private matchFileDiff(
    coveragePath: string,
    diffMap: DiffMap,
  ): { additions: number[]; deletions: number[] } | null {
    // 直接匹配
    const base = process.cwd();
    const relativePath = path.relative(base, coveragePath);
    return diffMap[relativePath] || null;
  }

  /**
   * 计算变更代码的覆盖率
   * @param fileData - 文件覆盖率数据
   * @param addLines - 新增的行号数组
   * @returns 变更覆盖率统计信息
   */
  private calculateChangedCoverage(
    fileData: FileCoverage,
    addLines: number[],
  ): ChangedCoverage {
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
    const relatedStatements: Array<{
      stId: string;
      covered: boolean;
      count: number;
    }> = [];

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

  /**
   * 将文件数组转换为对象格式
   */
  private genCov(f: FileReportData[]): Record<string, FileReportData> {
    return f.reduce((p: Record<string, FileReportData>, c: FileReportData) => {
      return {
        ...p,
        [c.path]: c,
      };
    }, {});
  }

  private buildReportData(
    coverage: Record<string, FileCoverage>,
    diffMap: DiffMap = {},
    sourceFinder: (filePath: string) => string,
  ): ReportData {
    // 计算总体统计信息
    const summary: Record<string, unknown> = {};

    // 构建文件数组
    const files: FileReportData[] = Object.keys(coverage)
      .map((filePath) => {
        const fileData = coverage[filePath];

        // 读取源文件内容，如果失败则返回 null 以过滤掉该文件
        let source: string;
        try {
          source = fileData.source || sourceFinder(filePath);
        } catch (error) {
          console.warn(`Failed to read source file: ${filePath}`, error);
          return null;
        }

        // 如果 source 为空或无效，也过滤掉
        if (!source || source.trim().length === 0) {
          console.warn(`Source file is empty or invalid: ${filePath}`);
          return null;
        }

        // 获取该文件的变更行号（尝试匹配路径）
        const fileDiff = this.matchFileDiff(filePath, diffMap);
        const addLines = fileDiff?.additions || [];
        const delLines = fileDiff?.deletions || [];
        const changedLines = [...new Set([...addLines, ...delLines])].sort(
          (a, b) => a - b,
        );

        // 计算变更覆盖率
        const changedCoverage = this.calculateChangedCoverage(
          fileData,
          addLines,
        );

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
      })
      .filter((file): file is FileReportData => file !== null);

    const change1 = files.map((i) => {
      return {
        path: i.path,
        additions: i.diff.additions,
      };
    });

    const summaryResult = genSummaryTreeItem(
      '',
      genSummaryMapByCoverageMap(this.genCov(files), change1),
    );
    const newlinesPercent =
      (summaryResult.summary as any).changestatements?.pct ?? 0;

    // 将 newlinesPercent 添加到 summary
    summary['newlinesPercent'] = newlinesPercent;

    const reportData: ReportData = {
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

  private diffFn(diff = ''): DiffMap {
    if (!diff) {
      return {};
    }
    const parsedFiles = parseDiff(diff);

    // 构建文件路径到变更行号的映射
    const diffMap: DiffMap = {};

    parsedFiles.forEach((file) => {
      const filePath = file.to;
      if (!filePath) return;

      const additions: number[] = [];
      const deletions: number[] = [];

      file.chunks.forEach((chunk) => {
        chunk.changes.forEach((change) => {
          if (change.type === 'add' && change.ln) {
            additions.push(change.ln);
          }
          if (change.type === 'del' && change.ln) {
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

  async generate({
    coverage,
    targetDir,
    sourceFinder,
    reportConfig,
  }: GenerateOptions): Promise<GenerateResult> {
    // 解析 diff 数据
    const diffMap = this.diffFn(reportConfig?.diff || '');

    this.initOptions();

    // 构建报告数据，传入 diff 映射
    const reportData = this.buildReportData(coverage, diffMap, sourceFinder);

    // 复制dist文件夹内容到targetDir
    // 从 @canyonjs/report-html 包中复制 dist 目录
    try {
      const reportHtmlPath = require.resolve('@canyonjs/report-html');
      const reportHtmlDir = path.dirname(reportHtmlPath);
      const sourceDir = path.join(reportHtmlDir, 'dist');
      if (fs.existsSync(sourceDir)) {
        this.copyDistToTarget(sourceDir, targetDir);
      }
    } catch (error) {
      // 如果找不到 @canyonjs/report-html，尝试使用相对路径
      const sourceDir = path.resolve(__dirname, '../../report-html/dist');
      if (fs.existsSync(sourceDir)) {
        this.copyDistToTarget(sourceDir, targetDir);
      }
    }

    // 生成 report-data.js 文件
    const reportDataContent = `window.reportData = '${compress(JSON.stringify(reportData))}';`;
    const reportDataPath = path.join(targetDir, 'data/report-data.js');
    // 确保 data 目录存在
    const dataDir = path.dirname(reportDataPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(reportDataPath, reportDataContent, 'utf8');

    // 保存 newlinesPercent 到 coverage/canyon.json
    const canyonJsonPath = path.join(targetDir, 'canyon.json');
    const newlinesPercent = reportData.summary['newlinesPercent'] as
      | number
      | undefined;

    if (newlinesPercent !== undefined) {
      const canyonData = {
        newlinesPercent,
      };

      // 确保目录存在
      const canyonJsonDir = path.dirname(canyonJsonPath);
      if (!fs.existsSync(canyonJsonDir)) {
        fs.mkdirSync(canyonJsonDir, { recursive: true });
      }

      fs.writeFileSync(
        canyonJsonPath,
        JSON.stringify(canyonData, null, 2),
        'utf8',
      );
    }

    const result: GenerateResult = {
      reportPath: path.join(targetDir, 'index.html'),
      reportData,
    };
    return result;
  }
}

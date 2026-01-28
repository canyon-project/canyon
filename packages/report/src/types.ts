import type { FileCoverage } from 'istanbul-lib-coverage';

export interface ReportConfig {
  diff?: string;
}

export interface DiffMap {
  [filePath: string]: {
    additions: number[];
    deletions: number[];
  };
}

export interface ChangedCoverage {
  total: number;
  covered: number;
  pct: number;
}

export interface FileReportData {
  source: string;
  path: string;
  statementMap: FileCoverage['statementMap'];
  fnMap: FileCoverage['fnMap'];
  branchMap: FileCoverage['branchMap'];
  s: FileCoverage['s'];
  f: FileCoverage['f'];
  b: FileCoverage['b'];
  changedLines: number[];
  diff: {
    additions: number[];
    deletions: number[];
  };
  changestatements: ChangedCoverage;
}

export interface ReportData {
  instrumentCwd: string;
  type: string;
  reportPath: string;
  version: string;
  generatedAt: string;
  watermarks: {
    bytes: [number, number];
    statements: [number, number];
    branches: [number, number];
    functions: [number, number];
    lines: [number, number];
  };
  summary: Record<string, unknown>;
  files: FileReportData[];
}

export interface GenerateOptions {
  coverage: Record<string, FileCoverage>;
  targetDir: string;
  sourceFinder: (filePath: string) => string;
  reportConfig?: ReportConfig;
}

export interface GenerateResult {
  reportPath: string;
  reportData: ReportData;
}

export type CoverageStatus = 'high' | 'medium' | 'low';

export interface Watermarks {
  bytes: [number, number];
  statements: [number, number];
  branches: [number, number];
  functions: [number, number];
  lines: [number, number];
}

export interface CoverageMetrics {
  total: number;
  covered: number;
  uncovered?: number;
  blank?: number;
  comment?: number;
  pct: number;
  status: CoverageStatus;
}

export interface ReportSummary {
  bytes: CoverageMetrics;
  statements: CoverageMetrics;
  branches: CoverageMetrics;
  functions: CoverageMetrics;
  lines: CoverageMetrics;
}

export interface FileInfo {
  source: string;
  path: string;
  changedLines: number[];
}

export interface CanyonReportData {
  instrumentCwd: string;
  type: string;
  reportPath: string;
  version: string;
  watermarks: Watermarks;
  summary: ReportSummary;
  files: FileInfo[];
}

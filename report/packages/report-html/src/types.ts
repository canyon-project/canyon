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
  [key: string]: any;
}

export interface CanyonReportData {
  type: string;
  reportPath: string;
  version: string;
  watermarks: Watermarks;
  summary: ReportSummary;
  files: FileInfo[];
}

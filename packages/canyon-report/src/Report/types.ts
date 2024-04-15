export enum Dims {
  statements = 'statements',
  branches = 'branches',
  functions = 'functions',
  lines = 'lines',
}

export type OnSelectFile = (path: string) => Promise<{
  fileContent: string;
  fileCoverage: any;
  fileCodeChange: number[];
}>;

export type Watermarks = {
  [Dims.statements]: number[];
  [Dims.functions]: number[];
  [Dims.branches]: number[];
  [Dims.lines]: number[];
};

export type SummaryItem = {
  total: number;
  covered: number;
  skipped: number;
  pct: number;
};

export type Item = {
  lines: SummaryItem;
  functions: SummaryItem;
  statements: SummaryItem;
  branches: SummaryItem;
};
export type TrProps = {
  path: string;
  item: Item;
  watermarks: Watermarks;
  setActivePath: (path: string) => void;
};

export type IstanbulReportProps = {
  onSelectFile: OnSelectFile;
  watermarks: Watermarks;
  theme: string;
  defaultPath:string;
};

import { BranchMapping, FunctionMapping, Range } from 'istanbul-lib-coverage';

export interface CoverageResponse {
  status: 'success' | 'error';
  data: {
    coverage: number;
    timestamp: string;
  };
}

interface FileCoverageData {
  path: string;
  statementMap: { [key: string]: Range };
  fnMap: { [key: string]: FunctionMapping };
  branchMap: { [key: string]: BranchMapping };
  inputSourceMap?: any;
  s: { [key: string]: number };
  f: { [key: string]: number };
  b: { [key: string]: number[] };
}

export interface CoverageQueryParams {
  [key: string]: FileCoverageData;
}

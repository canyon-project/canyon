import type { FileCoverageData } from 'istanbul-lib-coverage';

export interface CoverageResponse {
  status: 'success' | 'error';
  data: {
    coverage: number;
    timestamp: string;
  };
}

// interface EeWai {
//   // instrumentCwd: string;
//   // provider: string;
//   // repoID: string;
//   // sha: string;
//   // branch: string;
//   // buildProvider: string;
//   // buildID: string;
//   // reportProvider: string;
//   // reportID: string;
//   // coverage
// }

export interface CoverageQueryParams {
  [key: string]: FileCoverageData;
}

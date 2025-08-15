// Common type definitions for the application

export interface Commit {
  id: string;
  sha: string;
  commitMessage: string;
  author: string;
  timestamp: string;
  buildID?: string;
  buildProvider?: string;
  pipelineCount: number;
  aggregationStatus: string;
  hasE2E?: boolean;
  hasUnitTest?: boolean;
  branches: string[];
}

export interface Repository {
  id: string;
  name: string;
  provider: string;
  org: string;
  repo: string;
}

export interface Build {
  id: string;
  buildID: string;
  buildProvider: string;
  modeList: BuildMode[];
  reportList?: Report[];
}

export interface BuildMode {
  mode: 'automated' | 'manual' | 'auto';
  coveragePercentage: number;
}

export interface Report {
  id: string;
  mode: string;
  coveragePercentage: number;
  passRate: number;
}

export interface OutletContext {
  commit?: Commit;
  repo?: Repository;
}

export interface HandleSelectFile {
  file: string;
  line?: number;
}

export interface CommitsListProps {
  commits: Commit[];
  selectedCommit: Commit | null;
  onCommitSelect: (commit: Commit) => void;
}

export interface CoverageOverviewPanelProps {
  build: Build;
  coverageDetailOpen?: boolean;
  setCoverageDetailOpen?: (open: boolean) => void;
}

export interface CommitCoverageOverviewProps {
  commit?: Commit;
  repo?: Repository;
  onChange: (params: { buildID: string; buildProvider: string }) => void;
  selectedBuildID?: string | null;
}
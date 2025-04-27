import * as crypto from 'node:crypto';

interface CoverageKey {
  provider: string;
  repoID: string;
  sha: string;
  buildProvider: string;
  buildID: string;
  reportProvider: string;
  reportID: string;
}

export function generateCoverageId(key: CoverageKey): string {
  const raw = [
    key.provider,
    key.repoID,
    key.sha,
    key.buildProvider,
    key.buildID,
    key.reportProvider,
    key.reportID,
  ].join('#');
  return crypto.createHash('sha256').update(raw).digest('hex');
}

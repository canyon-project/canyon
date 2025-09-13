import { Injectable } from '@nestjs/common';

@Injectable()
export class CoverageOverviewService {
  constructor() {}
  async getOverview({
    provider,
    repoID,
    sha,
    buildProvider,
    buildID,
    reportProvider,
    reportID,
    filePath,
  }) {
    return {
      provider,
      repoID,
      sha,
      buildProvider,
      buildID,
      reportProvider,
      reportID,
      filePath,
    };
  }
}

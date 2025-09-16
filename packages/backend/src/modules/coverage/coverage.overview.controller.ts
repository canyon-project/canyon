import { Controller, Get, Param } from '@nestjs/common';
import { CoverageOverviewService } from './services/coverage.overview.service';

@Controller('api/provider/:provider/repo/:repoID/coverage/overview')
export class CoverageOverviewController {
  constructor(private readonly overview: CoverageOverviewService) {}

  @Get('commits/:sha')
  async getCommitOverview(
    @Param('provider') provider: string,
    @Param('repoID') repoID: string,
    @Param('sha') sha: string,
  ) {
    return this.overview.getOverview({ provider, repoID, sha });
  }

  @Get('pulls/:pullNumber')
  async getPullOverview(
    @Param('provider') provider: string,
    @Param('repoID') repoID: string,
    @Param('pullNumber') pullNumber: string,
  ) {
    return this.overview.getPullOverview({
      provider,
      repoID,
      pullID: pullNumber,
    });
  }
}

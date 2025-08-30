import { Args, Query, Resolver } from '@nestjs/graphql';
import { JSONScalar } from '../../scalars/json.scalar';
import { CoverageOverviewService } from './services/coverage.overview.service';

@Resolver()
export class CoverageOverviewResolver {
  constructor(private readonly overview: CoverageOverviewService) {}

  @Query(() => JSONScalar)
  coverageOverview(
    @Args('provider', { type: () => String }) provider: string,
    @Args('repoID', { type: () => String }) repoID: string,
    @Args('sha', { type: () => String }) sha: string,
    @Args('buildProvider', { type: () => String, nullable: true })
    buildProvider?: string,
    @Args('buildID', { type: () => String, nullable: true }) buildID?: string,
    @Args('reportProvider', { type: () => String, nullable: true })
    reportProvider?: string,
    @Args('reportID', { type: () => String, nullable: true }) reportID?: string,
    @Args('filePath', { type: () => String, nullable: true }) filePath?: string,
  ) {
    return this.overview.getOverview({
      provider,
      repoID,
      sha,
      buildProvider,
      buildID,
      reportProvider,
      reportID,
      filePath,
    });
  }
}

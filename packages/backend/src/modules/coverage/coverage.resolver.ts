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
  ) {
    return this.overview.getOverview({
      provider,
      repoID,
      sha,
    });
  }

  @Query(() => JSONScalar)
  pullCoverageOverview(
    @Args('provider', { type: () => String }) provider: string,
    @Args('repoID', { type: () => String }) repoID: string,
    @Args('pullID', { type: () => String }) pullID: string,
  ) {
    return this.overview.getPullOverview({
      provider,
      repoID,
      pullID,
    });
  }
}

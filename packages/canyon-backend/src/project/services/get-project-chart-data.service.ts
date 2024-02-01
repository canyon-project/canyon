import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { calculateCoverageOverviewByConditionFilter } from '../../utils/summary';
// import { getProjectByID } from '../adapter/gitlab.adapter';
@Injectable()
export class GetProjectChartDataService {
  constructor(private readonly prisma: PrismaService) {}
  async invoke(projectID) {
    const allCovTypeCoverages = await this.prisma.coverage.findMany({
      where: {
        projectID: projectID,
        covType: 'all',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const summarys = await this.prisma.summary.findMany({
      where: {
        sha: {
          in: [...allCovTypeCoverages.map((item) => item.sha)],
        },
      },
    });

    return allCovTypeCoverages
      .map((item) => {
        return {
          sha: item.sha,
          statements: calculateCoverageOverviewByConditionFilter(
            summarys.filter(
              ({ sha: curCommitSha, covType }) =>
                curCommitSha === item.sha && 'all' === covType,
            ),
          ).statements.pct,
          newlines: calculateCoverageOverviewByConditionFilter(
            summarys.filter(
              ({ sha: curCommitSha, covType }) =>
                curCommitSha === item.sha && 'all' === covType,
            ),
          ).newlines.pct,
        };
      })
      .reverse();
    // .slice(-10);
  }
}

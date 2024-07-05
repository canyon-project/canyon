import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { removeNullKeys } from '../../utils/utils';
// import { getProjectByID } from '../adapter/gitlab.adapter';
@Injectable()
export class GetProjectChartDataService {
  constructor(private readonly prisma: PrismaService) {}
  async invoke(projectID, branch) {
    const { defaultBranch } = await this.prisma.project.findFirst({
      where: {
        id: projectID,
      },
    });
    const allCovTypeCoverages = await this.prisma.coverage.findMany({
      where: removeNullKeys({
        projectID: projectID,
        covType: 'all',
        branch: defaultBranch === '-' ? null : defaultBranch,
      }),
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const summarys = [];
    // console.log(allCovTypeCoverages, 'allCovTypeCoverages');
    return allCovTypeCoverages
      .map((item) => {
        return {
          sha: item.sha,
          statements: item.summary['statements']['pct'],
          newlines: item.summary['newlines']['pct'],
        };
      })
      .reverse();
    // .slice(-10);
  }
}

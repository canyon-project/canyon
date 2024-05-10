import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { removeNullKeys } from '../../utils/utils';
import { emptyStatistics } from '../../constant';

@Injectable()
export class RetrieveCoverageTreeSummaryService {
  constructor(private readonly prisma: PrismaService) {}

  async invoke(params: { reportID?: string; sha?: string }) {
    const redirectUri = process.env.REDIRECT_URI;

    try {
      const summaryFindFirst = await this.prisma.coverage.findFirst({
        where: removeNullKeys({
          reportID: params.reportID,
          sha: params.sha,
          covType: 'agg',
        }),
      });

      const sha = summaryFindFirst?.sha;
      const noCommitShaWithCoverage = await this.prisma.coverage.findFirst({
        where: removeNullKeys({
          reportID: params.reportID,
          sha: params.sha,
        }),
      });
      const project = await this.prisma.project.findFirst({
        where: {
          id: noCommitShaWithCoverage.projectID,
        },
      });
      if (!sha) {
        return {
          status: 'pending',
          reportIDs: [],
          sha: noCommitShaWithCoverage?.sha || '',
          statistics: emptyStatistics,
          projectID: noCommitShaWithCoverage?.projectID || '',
          projectPathWithNamespace: project?.pathWithNamespace || '',
        };
      }

      const users = await this.prisma.user.findMany();

      const coverageAggs = await this.prisma.coverage.findMany({
        where: {
          sha,
          covType: 'agg',
        },
      });

      const reportIDs = coverageAggs.map((coverageAgg) => {
        return {
          reportID: coverageAgg.reportID,
          reporter: Number(coverageAgg.reporter),
          reporterUsername:
            users.find((user) => user.id === Number(coverageAgg.reporter))
              ?.username || '',
          reporterTime: coverageAgg.updatedAt,
          statistics: coverageAgg.summary,
        };
      });

      const coverageAll = await this.prisma.coverage.findFirst({
        where: {
          sha,
          covType: 'all',
        },
      });

      return {
        status: 'success',
        reportIDs: reportIDs,
        reportUrl: `${(redirectUri || '').replace('/oauth', '')}/projects/${coverageAggs[0]?.projectID || ''}/commits/${sha}`,
        sha: sha,
        statistics: coverageAll.summary,
        projectID: coverageAggs[0]?.projectID || '',
        projectPathWithNamespace: project.pathWithNamespace,
      };
    } catch (e) {
      return {
        status: 'fail',
        reportIDs: [],
        sha: params.sha || '',
        statistics: emptyStatistics,
        projectID: '',
        projectPathWithNamespace: '',
      };
    }
  }
}

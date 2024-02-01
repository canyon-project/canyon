import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { calculateCoverageOverviewByConditionFilter } from '../../utils/summary';
import { removeNullKeys } from '../../utils/utils';
import { emptyStatistics } from '../../constant';

@Injectable()
export class RetrieveCoverageTreeSummaryService {
  constructor(private readonly prisma: PrismaService) {}

  async invoke(params: { reportID?: string; sha?: string }) {
    const redirectUri = process.env.REDIRECT_URI;

    try {
      const summaryFindFirst = await this.prisma.summary.findFirst({
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

      const coverages = await this.prisma.coverage.findMany({
        where: {
          sha,
          covType: 'agg',
        },
      });

      const summarys = await this.prisma.summary.findMany({
        where: {
          sha,
        },
      });

      const reportIDs = summarys
        .filter((summary) => summary.covType === 'agg')
        .reduce((acc, summary) => {
          const find = acc.find((item) => item.reportID === summary.reportID);
          if (find) {
            find.summarys.push(summary);
          } else {
            acc.push({
              reportID: summary.reportID,
              reporterTime: summary.createdAt,
              reporter:
                coverages.find((coverage) => {
                  return coverage.reportID === summary.reportID;
                })?.reporter || '',
              summarys: [summary],
            });
          }
          return acc;
        }, [])
        .map((item) => ({
          reportID: item.reportID,
          reporter: item.reporter,
          reporterUsername:
            users.find((user) => user.id === item.reporter)?.username || '',
          reporterTime: item.reporterTime,
          statistics: calculateCoverageOverviewByConditionFilter(item.summarys),
        }));

      return {
        status: 'success',
        reportIDs: reportIDs,
        reportUrl: `${(redirectUri || '').replace('/login', '')}/projects/${coverages[0]?.projectID || ''}/commits/${sha}`,
        sha: sha,
        statistics: calculateCoverageOverviewByConditionFilter(
          summarys.filter((summary) => summary.covType === 'all'),
        ),
        projectID: coverages[0]?.projectID || '',
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

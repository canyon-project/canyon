import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { calculateCoverageOverviewByConditionFilter } from '../../utils/summary';
// import process from 'process';
import { getCommits } from '../../adapter/gitlab.adapter';
import { percent } from '../../utils/utils';
// import { getProjectByID } from '../adapter/gitlab.adapter';
@Injectable()
export class GetProjectRecordDetailByShaService {
  constructor(private readonly prisma: PrismaService) {}
  async invoke(projectID, sha): Promise<any> {
    const coverages = await this.prisma.coverage.findMany({
      where: {
        projectID,
        sha,
        covType: 'agg',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const users = await this.prisma.user.findMany({
      where: {},
    });

    const rows = [];

    for (let i = 0; i < coverages.length; i++) {
      const coverage = coverages[i];
      const summarys = await this.prisma.summary.findMany({
        where: {
          sha: sha,
          covType: 'agg',
          metricType: {
            in: ['statements', 'newlines'],
          },
        },
      });
      const s = summarys.find((item) => {
        return (
          item.reportID === coverage.reportID &&
          item.metricType === 'statements'
        );
      });
      const l = summarys.find((item) => {
        return (
          item.reportID === coverage.reportID && item.metricType === 'newlines'
        );
      });
      const data = {
        ...coverage,
        compareUrl: '',
        webUrl: '',
        newlines: percent(l.covered, l.total),
        statements: percent(s.covered, s.total),
        lastReportTime: new Date(),
        times: 0,
        logs: [],
        message: '',
        reporterUsername: users.find(({ id: uId }) => uId === coverage.reporter)
          ?.nickname,
        reporterAvatar: users.find(({ id: uId }) => uId === coverage.reporter)
          ?.avatar,
      };
      rows.push(data);
    }
    return rows;
  }
}

//get-project-record-detail-by-sha.service.ts

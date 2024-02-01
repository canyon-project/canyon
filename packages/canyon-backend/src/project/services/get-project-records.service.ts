import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { calculateCoverageOverviewByConditionFilter } from '../../utils/summary';
// import process from 'process';
import { getCommits } from '../../adapter/gitlab.adapter';
import { percent } from '../../utils/utils';
// import process from 'process';
// import { getProjectByID } from '../adapter/gitlab.adapter';
@Injectable()
export class GetProjectRecordsService {
  constructor(private readonly prisma: PrismaService) {}
  async invoke(projectID, current, pageSize, keyword): Promise<any> {
    const whereCondition = {
      projectID,
      covType: 'all',
      OR: [
        // { description: { contains: keyword } },
        // { name: { contains: keyword } },
        { sha: { contains: keyword } },
        { branch: { contains: keyword } },
        { compareTarget: { contains: keyword } },
        // { message: { contains: keyword } },
      ],
    };

    const total = await this.prisma.coverage.count({
      where: whereCondition,
    });
    const coverages = await this.prisma.coverage.findMany({
      where: whereCondition,
      skip: (current - 1) * pageSize,
      take: pageSize,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const commits = await getCommits(
      {
        projectID,
        commitShas: coverages.map((item) => item.sha),
      },
      'accessToken',
    );

    const project = await this.prisma.project.findFirst({
      where: {
        id: projectID,
      },
    });

    const rows = [];

    for (let i = 0; i < coverages.length; i++) {
      const coverage = coverages[i];
      const summarys = await this.prisma.summary.findMany({
        where: {
          sha: coverage.sha,
          covType: 'all',
          metricType: {
            in: ['statements', 'newlines'],
          },
        },
      });
      const s = summarys.find((item) => {
        return item.sha === coverage.sha && item.metricType === 'statements';
      });
      const l = summarys.find((item) => {
        return item.sha === coverage.sha && item.metricType === 'newlines';
      });

      const cs = await this.prisma.coverage.findMany({
        where: {
          projectID,
          sha: coverage.sha,
          covType: 'agg',
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const data = {
        ...coverage,
        compareUrl: `${process.env.GITLAB_URL}/${project.pathWithNamespace}/-/compare/${coverage.compareTarget}...${coverage.sha}`,
        webUrl: commits.find(({ id }) => id === coverage.sha)?.web_url || '???',
        message:
          commits.find(({ id }) => id === coverage.sha)?.message || '???',
        newlines: percent(l.covered, l.total),
        statements: percent(s.covered, s.total),
        lastReportTime: cs[0]?.createdAt || new Date(),
        times: cs.length,
        logs: [],
      };
      rows.push(data);
    }
    return {
      data: rows,
      total,
    };
  }
}

//get-project-record-detail-by-sha.service.ts

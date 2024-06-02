import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { getCommits } from '../../adapter/gitlab.adapter';
@Injectable()
export class GetProjectRecordsService {
  constructor(private readonly prisma: PrismaService) {}
  async invoke(
    projectID,
    current,
    pageSize,
    keyword,
    onlyDefault,
  ): Promise<any> {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectID,
      },
    });
    const whereCondition = {
      projectID,
      covType: 'all',
      branch: project.defaultBranch,
      OR: [
        // { description: { contains: keyword } },
        // { name: { contains: keyword } },
        { sha: { contains: keyword } },
        { branch: { contains: keyword } },
        { compareTarget: { contains: keyword } },
        // { message: { contains: keyword } },
      ],
    };

    if (Boolean(onlyDefault) && project.defaultBranch !== '-') {
    } else {
      delete whereCondition.branch;
    }

    const total = await this.prisma.coverage.count({
      where: whereCondition,
    });
    const coverages = await this.prisma.coverage.findMany({
      where: whereCondition,
      skip: (current - 1) * pageSize,
      take: pageSize,
      orderBy: {
        updatedAt: 'desc',
      },
    });
    const commits = await getCommits(
      {
        projectID: projectID.split('-')[1],
        commitShas: coverages.map((item) => item.sha),
      },
      'accessToken',
    );
    const rows = [];

    const csList = await Promise.all(
      coverages.map((coverage) =>
        this.prisma.coverage.findMany({
          where: {
            projectID,
            sha: coverage.sha,
            covType: 'agg',
          },
          orderBy: {
            updatedAt: 'desc',
          },
        }),
      ),
    );

    for (let i = 0; i < coverages.length; i++) {
      const coverage = coverages[i];

      const cs = csList[i];

      const data = {
        ...coverage,
        compareUrl: `${process.env.GITLAB_URL}/${project.pathWithNamespace}/-/compare/${coverage.compareTarget}...${coverage.sha}`,
        webUrl: commits.find(({ id }) => id === coverage.sha)?.web_url || '???',
        message:
          commits.find(({ id }) => id === coverage.sha)?.message || '???',
        newlines: coverage.summary['newlines']['pct'] || 100,
        statements: coverage.summary['statements']['pct'] || 100,
        functions: coverage.summary['functions']['pct'] || 100,
        branches: coverage.summary['branches']['pct'] || 100,
        lines: coverage.summary['lines']['pct'] || 100,
        lastReportTime: cs[0]?.updatedAt || coverage.createdAt, //没有agg类型的时候就用all的创建时间
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

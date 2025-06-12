import { PrismaService } from '../../../prisma/prisma.service';
import { Inject, Injectable } from '@nestjs/common';
import { ClickHouseClient } from '@clickhouse/client';
import { getCommits } from '../../../adapter/gitlab.adapter';

@Injectable()
export class GetRepoCommitsByRepoIdServices {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('CLICKHOUSE_CLIENT')
    private readonly clickhouseClient: ClickHouseClient,
  ) {}
  async invoke(repoID) {
    const project = await this.prisma.project
      .findFirst({
        where: {
          id: repoID,
        },
      })
      .then((r) => {
        // console.log(r);
        return r;
      });

    const coverageList = await this.prisma.coverage.findMany({
      where: {
        repoID: project?.id || '',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const gitProvider = await this.prisma.gitProvider.findFirst({
      where: {
        id: 'tripgl',
      },
    });

    const commitList = await getCommits(
      {
        projectID: project?.id || '',
        commitShas: [...new Set(coverageList.map((coverage) => coverage.sha))],
      },
      gitProvider?.privateToken || '',
      gitProvider?.url || '',
    );

    const coverageListObject = coverageList.reduce((prev: any, curr) => {
      if (prev[curr.sha]) {
        prev[curr.sha].coverageDetail.push(curr);
      } else {
        prev[curr.sha] = {
          sha: curr.sha,
          commitDetail: commitList.find((item) => item.id === curr.sha),
          coverageDetail: [curr],
        };
      }
      return prev;
    }, {});

    return Object.values(coverageListObject);
  }
}

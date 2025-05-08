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
  async invoke(pathWithNamespace) {
    const project = await this.prisma.project
      .findFirst({
        where: {
          pathWithNamespace: pathWithNamespace,
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

    const sss = coverageList.reduce((prev: any, curr) => {
      if (prev[curr.sha]) {
        prev[curr.sha].arr.push(curr);
      } else {
        prev[curr.sha] = {
          sha: curr.sha,
          arr: [curr],
        };
      }
      return prev;
    }, {});

    return {
      commitList,
      sss,
    };
  }
}

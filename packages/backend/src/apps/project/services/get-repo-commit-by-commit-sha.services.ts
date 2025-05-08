import { PrismaService } from '../../../prisma/prisma.service';
import { Inject, Injectable } from '@nestjs/common';
import { ClickHouseClient } from '@clickhouse/client';
import { getCommits } from '../../../adapter/gitlab.adapter';
import { coverageHitQuerySql } from '../../coverage/sql/coverage-hit-query.sql';
import { CoverageHitQuerySqlResultJsonInterface } from '../../coverage/types/coverage-final.types';

function genSUmar(sqlRes: { coverageID: string }[], coverages: string[]) {
  return sqlRes.filter(({ coverageID }) => coverages.includes(coverageID))
    .length;
}

@Injectable()
export class GetRepoCommitByCommitShaServices {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('CLICKHOUSE_CLIENT')
    private readonly clickhouseClient: ClickHouseClient,
  ) {}
  async invoke(pathWithNamespace: string, sha: string) {
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
        sha: sha,
      },
    });
    console.log(...new Set(coverageList.map((i) => i.reportProvider)));

    const dbRes = await this.clickhouseClient
      .query({
        query: coverageHitQuerySql(coverageList, {}),
        format: 'JSONEachRow',
      })
      .then((r) => r.json<CoverageHitQuerySqlResultJsonInterface>());

    const groups = {
      buildID: 'xxx',
      buildProvider: 'xxx',
      summary: genSUmar(
        dbRes,
        coverageList.map(({ id }) => id),
      ),
      modeList: [
        {
          mode: 'auto',
          summary: genSUmar(
            dbRes,
            coverageList
              .filter(({ reportProvider }) =>
                ['mpaas', 'flytest'].includes(reportProvider),
              )
              .map(({ id }) => id),
          ),
          reportList: coverageList
            .filter(({ reportProvider }) =>
              ['mpaas', 'flytest'].includes(reportProvider),
            )
            .map((i) => {
              return {
                summary: genSUmar(dbRes, [i.id]),
              };
            }),
        },
        {
          mode: 'personal',
          summary: genSUmar(
            dbRes,
            coverageList
              .filter(({ reportProvider }) =>
                ['person'].includes(reportProvider),
              )
              .map(({ id }) => id),
          ),
          reportList: coverageList
            .filter(({ reportProvider }) => ['person'].includes(reportProvider))
            .map((i) => {
              return {
                summary: genSUmar(dbRes, [i.id]),
              };
            }),
        },
      ],
    };
    return groups;
  }
}

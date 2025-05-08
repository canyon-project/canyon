import { PrismaService } from '../../../prisma/prisma.service';
import { Inject, Injectable } from '@nestjs/common';
import { ClickHouseClient } from '@clickhouse/client';
import { getCommits } from '../../../adapter/gitlab.adapter';
import { coverageHitQuerySql } from '../../coverage/sql/coverage-hit-query.sql';
import { CoverageHitQuerySqlResultJsonInterface } from '../../coverage/types/coverage-final.types';
import { mergeHit } from '../../coverage/helpers/mergeHit';
import { genHitByMap } from '../../../utils/genHitByMap';
import { CoverageFinalService } from '../../coverage/services/core/coverage-final.service';

function genSUmar(
  sqlRes: { coverageID: string }[],
  coverages: string[],
  initCovObj,
) {
  return mergeHit(
    sqlRes.filter(({ coverageID }) => coverages.includes(coverageID)),
    initCovObj,
  );
}

@Injectable()
export class GetRepoCommitByCommitShaServices {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('CLICKHOUSE_CLIENT')
    private readonly clickhouseClient: ClickHouseClient,
    private readonly coverageFinalService: CoverageFinalService,
  ) {}
  async invoke(pathWithNamespace: string, sha: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        pathWithNamespace: pathWithNamespace,
      },
    });

    const coverageList = await this.prisma.coverage.findMany({
      where: {
        repoID: project?.id || '',
        sha: sha,
      },
    });

    const dbRes = await this.clickhouseClient
      .query({
        query: coverageHitQuerySql(coverageList, {}),
        format: 'JSONEachRow',
      })
      .then((r) => r.json<CoverageHitQuerySqlResultJsonInterface>());

    const groupList = coverageList.map(({ buildProvider, buildID }) => ({
      buildProvider,
      buildID,
    }));

    function deduplicateArray(arr) {
      const map = new Map();
      const result: any[] = [];

      arr.forEach((item: any) => {
        const key = `${item.buildProvider}-${item.buildID}`;
        if (!map.has(key)) {
          map.set(key, item);
          result.push(item);
        }
      });

      return result;
    }

    const firstCov = coverageList[0];

    const quchongList = deduplicateArray(groupList);

    const gList: any[] = [];

    for (let jjjjj = 0; jjjjj < quchongList.length; jjjjj++) {
      const { buildID, buildProvider } = quchongList[jjjjj];

      const zongdeConFinal = await this.coverageFinalService.invoke(
        firstCov.provider,
        firstCov.repoID,
        firstCov.sha,
        buildProvider,
        buildID,
      );

      const initCovObj = zongdeConFinal.data;

      const groups = {
        buildID,
        buildProvider,
        summary: genSUmar(
          dbRes,
          coverageList
            .filter((item) => {
              return (
                item.buildProvider === buildProvider && item.buildID === buildID
              );
            })
            .map(({ id }) => id),
          initCovObj,
        ),
        modeList: [
          {
            mode: 'auto',
            summary: genSUmar(
              dbRes,
              coverageList
                .filter(
                  (item) =>
                    ['mpaas', 'flytest'].includes(item.reportProvider) &&
                    item.buildProvider === buildProvider &&
                    item.buildID === buildID,
                )
                .map(({ id }) => id),
              initCovObj,
            ),
            reportList: coverageList
              .filter(
                (item) =>
                  ['mpaas', 'flytest'].includes(item.reportProvider) &&
                  item.buildProvider === buildProvider &&
                  item.buildID === buildID,
              )
              .map((i) => {
                return {
                  summary: genSUmar(dbRes, [i.id], initCovObj),
                };
              }),
          },
          {
            mode: 'personal',
            summary: genSUmar(
              dbRes,
              coverageList
                .filter(
                  (item) =>
                    ['person'].includes(item.reportProvider) &&
                    item.buildProvider === buildProvider &&
                    item.buildID === buildID,
                )
                .map(({ id }) => id),
              initCovObj,
            ),
            reportList: coverageList
              .filter(
                (item) =>
                  ['person'].includes(item.reportProvider) &&
                  item.buildProvider === buildProvider &&
                  item.buildID === buildID,
              )
              .map((i) => {
                return {
                  summary: genSUmar(dbRes, [i.id], initCovObj),
                };
              }),
          },
        ],
      };
      gList.push(groups);
    }
    return gList;
  }
}

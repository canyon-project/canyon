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
    sqlRes.filter(({ coverageID }) => {
      return coverages.includes(coverageID);
    }),
    initCovObj,
  );
}

// TODO   // 需要准备map数据

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

    const startFindCoverage = Date.now();
    const coverageList = await this.prisma.coverage.findMany({
      where: {
        repoID: project?.id || '',
        sha: sha,
      },
    });
    const endFindCoverage = Date.now();
    console.log(
      `findMany coverage耗时: ${endFindCoverage - startFindCoverage}ms`,
    );

    const buildGroupList = coverageList.map(({ buildProvider, buildID }) => ({
      buildProvider,
      buildID,
    }));

    const deduplicatedBuildGroupList = this.deduplicateArray(buildGroupList);

    const resultList: any[] = [];
    // 并行执行 ClickHouse 查询和 coverageFinalService.invoke
    const [dbRes, ...coverageFinalResults] = await Promise.all([
      this.clickhouseClient
        .query({
          query: coverageHitQuerySql(coverageList, {}),
          format: 'JSONEachRow',
        })
        .then((r) => r.json<CoverageHitQuerySqlResultJsonInterface>()),
      ...deduplicatedBuildGroupList.map(async ({ buildID, buildProvider }) => {
        const startTime = Date.now();
        // 这里多查了一次hit表，需要优化
        const coverageFinalResult = await this.coverageFinalService.invoke(
          coverageList[0].provider,
          coverageList[0].repoID,
          coverageList[0].sha,
          buildProvider,
          buildID,
        );
        console.log(Date.now() - startTime, 'coverageFinalService耗时');
        return coverageFinalResult;
      }),
    ]);

    deduplicatedBuildGroupList.forEach(({ buildID, buildProvider }, index) => {
      const initCovObj = coverageFinalResults[index].data;

      const group = {
        buildID,
        buildProvider,
        coverage: genSUmar(
          dbRes,
          coverageList
            .filter(
              (item) =>
                item.buildProvider === buildProvider &&
                item.buildID === buildID,
            )
            .map(({ id }) => id),
          initCovObj,
        ),
        modeList: [
          {
            type: 'auto',
            caseList: coverageList
              .filter(
                (item) =>
                  ['mpaas', 'flytest'].includes(item.reportProvider) &&
                  item.buildProvider === buildProvider &&
                  item.buildID === buildID,
              )
              .map((i) => ({
                coverage: genSUmar(dbRes, [i.id], initCovObj),
                ...i,
              })),
          },
          {
            type: 'manual',
            caseList: coverageList
              .filter(
                (item) =>
                  ['person'].includes(item.reportProvider) &&
                  item.buildProvider === buildProvider &&
                  item.buildID === buildID,
              )
              .map((i) => ({
                coverage: genSUmar(dbRes, [i.id], initCovObj),
                ...i,
              })),
          },
        ],
      };
      resultList.push(group);
    });

    return resultList;
  }

  private deduplicateArray(arr: any[]): any[] {
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
}

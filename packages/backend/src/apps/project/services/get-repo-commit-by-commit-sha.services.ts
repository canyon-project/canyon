// @ts-nocheck
import { PrismaService } from '../../../prisma/prisma.service';
import { Inject, Injectable } from '@nestjs/common';
import { ClickHouseClient } from '@clickhouse/client';
import { getCommits } from '../../../adapter/gitlab.adapter';
import { coverageHitQuerySql } from '../../coverage/sql/coverage-hit-query.sql';
import {
  CoverageHitQuerySqlResultJsonInterface,
  CoverageMapQuerySqlResultJsonInterface,
} from '../../coverage/types/coverage-final.types';
import { mergeHit } from '../../coverage/helpers/mergeHit';
import { genHitByMap } from '../../../utils/genHitByMap';
import { CoverageFinalService } from '../../coverage/services/core/coverage-final.service';
import { CoverageMapService } from '../../coverage/services/core/coverage-map.service';
import { coverageMapQuerySql } from '../../coverage/sql/coverage-map-query.sql';
import { percent } from 'canyon-data';

function calcCoverageSumary(covHit, covMap) {
  const hitMap = new Map();
  for (let i = 0; i < covHit.length; i++) {
    const covHitItem = covHit[i];
    const path = covHitItem.fullFilePath;
    if (!hitMap.has(path)) {
      hitMap.set(path, {
        s: new Set(covHitItem.s),
      });
    } else {
      const hitMapItem = hitMap.get(path);
      covHitItem.s.forEach((val) => hitMapItem.s.add(val));
    }
  }
  let num1 = 0;
  let num2 = 0;

  // const map = new Map();

  // 遍历hitMap
  for (const [key, value] of hitMap.entries()) {
    num1 += value.s.size;
  }

  // 遍历covMap
  for (let i = 0; i < covMap.length; i++) {
    const covMapItem = covMap[i];
    num2 += covMapItem.s.length;
  }

  return {
    total: num2,
    covered: num1,
    percent: percent(num1, num2),
  };
}

function filterCoverageHit(releationIDList, covHit) {
  return covHit.filter((val) => {
    return releationIDList.includes(val.coverageID);
  });
}

@Injectable()
export class GetRepoCommitByCommitShaServices {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('CLICKHOUSE_CLIENT')
    private readonly clickhouseClient: ClickHouseClient,
    private readonly coverageFinalService: CoverageFinalService,
    private readonly coverageMapService: CoverageMapService,
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

    const buildGroupList = coverageList.map(({ buildProvider, buildID }) => ({
      buildProvider,
      buildID,
    }));

    const coverageMapRelationList =
      await this.prisma.coverageMapRelation.groupBy({
        by: ['coverageMapHashID', 'fullFilePath'],
        where: {
          coverageID: {
            in: coverageList.map((coverage) => coverage.id),
          },
        },
      });

    const deduplicateHashIDList = [
      ...new Set(coverageMapRelationList.map((i) => i.coverageMapHashID)),
    ];
    const coverageHitQuerySqlResultJson = await this.clickhouseClient
      .query({
        query: `SELECT
                  coverage_id as coverageID,
                  full_file_path as fullFilePath,
                  tupleElement(sumMapMerge(s), 1) AS s
                FROM default.coverage_hit_agg
                  WHERE coverage_id IN (${coverageList.map(({ id }) => `'${id}'`).join(', ')})
                GROUP BY coverage_id, full_file_path;`,
        format: 'JSONEachRow',
      })
      .then((r) => r.json());

    // SELECT
    // ANY(hash),  -- 返回该分组中的任意一个hash值（实际上所有值都相同）
    // ANY(other_column1),  -- 其他列同理
    // ANY(other_column2)
    // FROM coverage_map
    // WHERE hash IN ('0002b10d50119ed4226073f722350b6f2c4db2289b179cee65d71e4b256cba47', 'ssss')
    // GROUP BY hash;

    const coverageMapQuerySqlResultJson = await this.clickhouseClient
      .query({
        query: `SELECT
    hash,
    mapKeys(statement_map) AS s,
    mapKeys(fn_map) AS f,
    mapKeys(branch_map) AS b
FROM coverage_map
    WHERE hash IN (${deduplicateHashIDList.map((hash) => `'${hash}'`).join(', ')});`,
        format: 'JSONEachRow',
      })
      .then((r) => r.json());

    const coverageMapQuerySqlResultJsonWidth = [];

    for (let i = 0; i < coverageMapRelationList.length; i++) {
      const coverageMapRelationItem = coverageMapRelationList[i];
      const coverageMapQuerySqlResultJsonItem =
        coverageMapQuerySqlResultJson.find(
          (item) => item.hash === coverageMapRelationItem.coverageMapHashID,
        );

      if (coverageMapQuerySqlResultJsonItem) {
        coverageMapQuerySqlResultJsonWidth.push({
          ...coverageMapQuerySqlResultJsonItem,
          fullFilePath: coverageMapRelationItem.fullFilePath,
        });
      }
    }

    const deduplicatedBuildGroupList = this.deduplicateArray(buildGroupList);

    // ??
    const resultList = [];
    deduplicatedBuildGroupList.forEach(({ buildID, buildProvider }, index) => {
      const group = {
        buildID,
        buildProvider,
        summary: calcCoverageSumary(
          filterCoverageHit(
            coverageList
              .filter(
                (item) =>
                  item.buildProvider === buildProvider &&
                  item.buildID === buildID,
              )
              .map((item) => item.id),
            coverageHitQuerySqlResultJson,
          ),
          coverageMapQuerySqlResultJsonWidth,
        ),
        modeList: [
          {
            mode: 'auto',
            summary: calcCoverageSumary(
              filterCoverageHit(
                coverageList
                  .filter(
                    (item) =>
                      ['mpaas', 'flytest'].includes(item.reportProvider) &&
                      item.buildProvider === buildProvider &&
                      item.buildID === buildID,
                  )
                  .map((item) => item.id),
                coverageHitQuerySqlResultJson,
              ),
              coverageMapQuerySqlResultJsonWidth,
            ),
            caseList: coverageList
              .filter(
                (item) =>
                  ['mpaas', 'flytest'].includes(item.reportProvider) &&
                  item.buildProvider === buildProvider &&
                  item.buildID === buildID,
              )
              .map((i) => {
                return {
                  ...i,
                  summary: calcCoverageSumary(
                    filterCoverageHit([i.id], coverageHitQuerySqlResultJson),
                    coverageMapQuerySqlResultJsonWidth,
                  ),
                };
              }),
          },
          {
            mode: 'personal',
            summary: calcCoverageSumary(
              filterCoverageHit(
                coverageList
                  .filter(
                    (item) =>
                      ['person'].includes(item.reportProvider) &&
                      item.buildProvider === buildProvider &&
                      item.buildID === buildID,
                  )
                  .map((item) => item.id),
                coverageHitQuerySqlResultJson,
              ),
              coverageMapQuerySqlResultJsonWidth,
            ),
            caseList: coverageList
              .filter(
                (item) =>
                  ['person'].includes(item.reportProvider) &&
                  item.buildProvider === buildProvider &&
                  item.buildID === buildID,
              )
              .map((i) => {
                return {
                  ...i,
                  summary: calcCoverageSumary(
                    filterCoverageHit([i.id], coverageHitQuerySqlResultJson),
                    coverageMapQuerySqlResultJsonWidth,
                  ),
                };
              }),
          },
        ],
      };
      resultList.push(group);
    });

    return resultList;

    // // ??
    //
    // const { covered, total } = calcCoverageSumary(
    //   coverageHitQuerySqlResultJson,
    //   coverageMapQuerySqlResultJsonWidth,
    // );
    //
    // return {
    //   covered,
    //   total,
    //   percent: percent(covered, total),
    // };
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

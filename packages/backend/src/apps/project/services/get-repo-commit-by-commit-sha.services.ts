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

function ffffff(covHit, covMap) {
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

  const map = new Map();
  for (let i = 0; i < covMap.length; i++) {
    const covMapItem = covMap[i];
    const path = covMapItem.fullFilePath;
    if (!map.has(path)) {
      map.set(path, {
        s: new Set(covMapItem.s),
      });
    }
    for (const [path, { s: totalSet }] of map.entries()) {
      num1 += totalSet.size;
    }

    for (const [path, { s: hitSet }] of hitMap.entries()) {
      num2 += hitSet.size;
    }
  }
  return {
    total: num1,
    covered: num2,
  };
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

    // console.log(coverageList.length)

    // const buildGroupList = coverageList.map(({ buildProvider, buildID }) => ({
    //   buildProvider,
    //   buildID,
    // }));

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
    console.log(deduplicateHashIDList.length);
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
      .then((r) => r.json())
      .then((r) => {
        return r.map((i) => {
          const s = coverageMapRelationList.find(
            (j) => j.coverageMapHashID === i.hash,
          );
          return {
            ...i,
            ...s,
          };
        });
      });

    const m = new Map();

    for (let i = 0; i < coverageMapQuerySqlResultJson.length; i++) {
      const key = coverageMapQuerySqlResultJson[i].fullFilePath;
      const value = coverageMapQuerySqlResultJson[i];
      m.set(key, value);
    }

    const arr = [];

    for (const [k, v] of m.entries()) {
      arr.push(v);
    }

    console.log(arr.length, coverageHitQuerySqlResultJson.length);

    const { covered, total } = ffffff(coverageHitQuerySqlResultJson, arr);

    return {
      covered,
      total,
      percent: percent(covered, total),
    };
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

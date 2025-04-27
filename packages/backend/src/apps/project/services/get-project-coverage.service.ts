import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ClickHouseClient } from '@clickhouse/client';
import { dbToIstanbul } from '../../../utils/dbToIstanbul';
// import { PrismaService } from '../../prisma/prisma.service';
// import { within30days } from '../../utils/utils';
// import { percent } from 'canyon-data';
// import * as dayjs from 'dayjs';

@Injectable()
export class GetProjectCoverageService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('CLICKHOUSE_CLIENT')
    private readonly clickhouseClient: ClickHouseClient,
  ) {}
  async invoke(provider, repoID, sha, buildProvider, buildID) {
    if (!provider || !repoID || !sha || !buildProvider || !buildID) {
      return {
        error: 'provider, repoID, sha are required',
      };
    }
    const coverages = await this.prisma.coverage.findMany({
      where: {
        provider: provider,
        repoID: repoID,
        sha: sha,
        buildProvider: buildProvider,
        buildID: buildID,
      },
    });

    // 查询 Postgres：哪些 hash 出现在哪些路径中
    const coverageMapRelationList =
      await this.prisma.coverageMapRelation.findMany({
        where: {
          coverageID: {
            in: coverages.map((coverage) => coverage.id),
          },
        },
      });

    // 构造 hash -> relative_paths[] 映射表
    const hashToPaths = new Map<string, string>();
    for (const item of coverageMapRelationList) {
      hashToPaths.set(item.hashID, item.relativePath);
    }

    // 查询 ClickHouse：查 hash 对应的 coverage_map
    const sethashs = [...new Set(coverageMapRelationList.map((i) => i.hashID))];

    const queryS = `
  SELECT *
  FROM coverage_map
  WHERE hash IN (${sethashs.map((h) => `'${h}'`).join(', ')});
`;

    const resultS = await this.clickhouseClient.query({
      query: queryS,
      format: 'JSONEachRow',
    });
    const rawData = await resultS.json(); // [{ hash: ..., statement_map: ..., ... }, ...]

    // 将 file_path 挂上去
    const dataWithPath = rawData.map((i: any) => {
      const file_path = hashToPaths.get(i.hash);
      return {
        ...i,
        relative_path: file_path,
      };
    });

    // 返回带 file_path 的数据，或者传给 dbToIstanbul

    const queryF = `SELECT
                      coverage_id,
    relative_path,
    sumMapMerge(s_map) AS merged_s,
    sumMapMerge(f_map) AS merged_f,
    sumMapMerge(b_map) AS merged_b
FROM default.coverage_hit_agg
                    WHERE coverage_id IN (${coverages.map((h) => `'${h.id}'`).join(', ')})
GROUP BY coverage_id, relative_path;`;

    const resultF = await this.clickhouseClient.query({
      query: queryF,
      format: 'JSONEachRow',
    });
    const dataF = await resultF.json();

    return dbToIstanbul(dataWithPath, dataF);
  }
}

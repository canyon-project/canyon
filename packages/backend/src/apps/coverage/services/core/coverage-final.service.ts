import { Inject, Injectable } from '@nestjs/common';
import { ClickHouseClient } from '@clickhouse/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { dbToIstanbul } from '../../../../utils/dbToIstanbul';

@Injectable()
export class CoverageFinalService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('CLICKHOUSE_CLIENT')
    private readonly clickhouseClient: ClickHouseClient,
  ) {}
  async invoke(
    provider: string,
    repoID: string,
    sha: string,
    buildProvider?: string,
    buildID?: string,
    reportProvider?: string,
    reportID?: string,
  ) {
    // 第一步：查询coverage表，获取所有的 coverageID
    const coverages = await this.prisma.coverage.findMany({
      where: {
        provider: provider,
        repoID: repoID,
        sha: sha,
        buildProvider: buildProvider,
        buildID: buildID,
        // reportProvider: reportProvider,
        // reportID: reportID,
      },
    });

    // 第二步：provider、repoID、sha、buildProvider、buildID确定一组 coverage_map
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

    // 第三步：查询 ClickHouse：查 coverage_hit_agg

    const queryF = `SELECT
                      coverage_id,
    relative_path,
    sumMapMerge(s_map) AS merged_s,
    sumMapMerge(f_map) AS merged_f,
    sumMapMerge(b_map) AS merged_b
FROM default.coverage_hit_agg
                    WHERE coverage_id IN (${coverages
                      .filter(
                        (i) =>
                          i.reportProvider === reportProvider &&
                          i.reportID === reportID,
                      )
                      .map((h) => `'${h.id}'`)
                      .join(', ')})
GROUP BY coverage_id, relative_path;`;

    const resultF = await this.clickhouseClient.query({
      query: queryF,
      format: 'JSONEachRow',
    });
    const dataF = await resultF.json();

    const unReMapedCov = dbToIstanbul(dataWithPath, dataF);
    const instrumentCwd = coverages[0].instrumentCwd;
    const realResCov = Object.values(unReMapedCov)
      .map((item: any) => {
        const path = item.path.replace(instrumentCwd + '/', '');
        return {
          ...item,
          path,
        };
      })
      .reduce((acc, cur) => {
        acc[cur.path] = cur;
        return acc;
      }, {});

    return realResCov;
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { ClickHouseClient } from '@clickhouse/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { coverageMapQuerySql } from '../../sql/coverage-map-query.sql';
import { coverageHitQuerySql } from '../../sql/coverage-hit-query.sql';
import { getBranchTypeByIndex } from '../../../../utils/getBranchType';
import { genHitByMap } from '../../../../utils/genHitByMap';
import { decodeKey } from '../../../../utils/ekey';
import {
  CoverageHitQuerySqlResultJsonInterface,
  CoverageMapQuerySqlResultJsonInterface,
} from '../../types/coverage-final.types';
import { remapCoverage } from 'canyon-map';
import { removeCoverageInstrumentCwd } from '../../../../utils/removeCoverageInstrumentCwd';

/*

查询测试结果：

条件，booking项目1200个文件，含map
1. coverage表查询速度10ms
2. relation表，400ms (索引优化，进100ms)
3. ck map表，500ms (按需取，statement_map，进100ms)
4. ck hit表，1000ms (为什么要这么慢？)
5. 数据聚合+reMap 1000ms (有没有优化空间？异步)
* */

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
    filePath?: string,
  ) {
    const time = new Date().getTime();
    // 第一步：查询coverage表，获取所有的 coverageID。注意，此时不过滤reportProvider和reportID
    const coverages = await this.prisma.coverage.findMany({
      where: {
        provider: provider,
        repoID: repoID,
        sha: sha,
        buildProvider: buildProvider,
        buildID: buildID,
      },
    });
    console.log('耗时：', new Date().getTime() - time);
    // 第二步：provider、repoID、sha、buildProvider、buildID确定一组 coverage_map

    const time2 = new Date().getTime();
    const coverageMapRelationList =
      await this.prisma.coverageMapRelation.findMany({
        where: {
          coverageID: {
            in: coverages.map((coverage) => coverage.id),
          },
          relativePath: filePath,
        },
      });
    console.log('耗时2：', new Date().getTime() - time2);
    // 以下操作为了去除重复的 hashID
    // 构造 hash -> relative_paths[] 映射表
    const hashToPaths = new Map<
      string,
      {
        file_path: string;
        input_source_map: string;
      }
    >();
    for (const item of coverageMapRelationList) {
      hashToPaths.set(item.hashID, {
        file_path: item.relativePath,
        input_source_map: item.inputSourceMap,
      });
    }
    // 查询 ClickHouse：查 hash 对应的 coverage_map
    const deduplicateHashIDList = [
      ...new Set(coverageMapRelationList.map((i) => i.hashID)),
    ];
    // console.log(coverageMapRelationList,'coverageMapRelationList')
    // coverageMapQuerySqlResult
    const time3 = new Date().getTime();
    const coverageMapQuerySqlResult = await this.clickhouseClient.query({
      query: coverageMapQuerySql(deduplicateHashIDList),
      format: 'JSONEachRow',
    });

    const coverageMapQuerySqlResultJson: CoverageMapQuerySqlResultJsonInterface[] =
      await coverageMapQuerySqlResult.json();

    // 将 file_path 挂上去
    const coverageMapQuerySqlResultJsonWithRelativePath =
      coverageMapQuerySqlResultJson.map((item) => {
        const relaHashToPaths = hashToPaths.get(item.hash);
        return {
          ...item,
          relative_path: relaHashToPaths?.file_path || '',
          input_source_map: relaHashToPaths?.input_source_map || '',
        };
      });
    console.log('耗时3：', new Date().getTime() - time3);
    // 返回带 file_path 的数据，或者传给 dbToIstanbul

    // 第三步：查询 ClickHouse：查 coverage_hit_agg
    const time4 = new Date().getTime();
    const coverageHitQuerySqlResult = await this.clickhouseClient.query({
      query: coverageHitQuerySql(coverages, {
        reportProvider,
        reportID,
      }),
      format: 'JSONEachRow',
    });
    const coverageHitQuerySqlResultJson: CoverageHitQuerySqlResultJsonInterface[] =
      await coverageHitQuerySqlResult.json();
    console.log('耗时4：', new Date().getTime() - time4);

    const time5 = new Date().getTime();
    const res = await this.mergeCoverageMapAndHitQuerySqlResultsTOIstanbul(
      coverageMapQuerySqlResultJsonWithRelativePath,
      coverageHitQuerySqlResultJson,
    );
    console.log('耗时5：', new Date().getTime() - time5);
    const instrumentCwd = coverages[0].instrumentCwd;
    // return res;
    return removeCoverageInstrumentCwd(res, instrumentCwd);
  }

  //   合并 coverageMapQuerySqlResult、coverageHitQuerySqlResult
  mergeCoverageMapAndHitQuerySqlResultsTOIstanbul(
    coverageMapQuerySqlResultJson: (CoverageMapQuerySqlResultJsonInterface & {
      relative_path: string;
    })[],
    coverageHitQuerySqlResultJson: CoverageHitQuerySqlResultJsonInterface[],
  ) {
    const time6 = new Date().getTime();
    const result = {};

    coverageMapQuerySqlResultJson.forEach((item) => {
      const beigin = {
        path: item.relative_path,
        inputSourceMap: item.input_source_map
          ? JSON.parse(item.input_source_map)
          : undefined,
        statementMap: Object.entries(item.statement_map).reduce(
          (acc, [key, [startLine, startColumn, endLine, endColumn]]) => {
            acc[key] = {
              start: {
                line: startLine,
                column: startColumn,
              },
              end: {
                line: endLine,
                column: endColumn,
              },
            };
            return acc;
          },
          {},
        ),
        fnMap: Object.entries(item.fn_map).reduce(
          (
            acc,
            [
              key,
              [
                name,
                line,
                [startLine, startColumn, endLine, endColumn],
                [startLine2, startColumn2, endLine2, endColumn2],
              ],
            ],
          ) => {
            acc[key] = {
              name,
              line,
              decl: {
                start: {
                  line: startLine,
                  column: startColumn,
                },
                end: {
                  line: endLine,
                  column: endColumn,
                },
              },
              loc: {
                start: {
                  line: startLine2,
                  column: startColumn2,
                },
                end: {
                  line: endLine2,
                  column: endColumn2,
                },
              },
            };
            return acc;
          },
          {},
        ),
        branchMap: Object.entries(item.branch_map).reduce(
          (acc, [key, [type, line, loc, locations]]) => {
            acc[key] = {
              type: getBranchTypeByIndex(type),
              line,
              loc: {
                start: {
                  line: loc[0],
                  column: loc[1],
                },
                end: {
                  line: loc[2],
                  column: loc[3],
                },
              },
              locations: locations.map(
                ([startLine, startColumn, endLine, endColumn]) => {
                  if (
                    [startLine, startColumn, endLine, endColumn].includes(0)
                  ) {
                    return {
                      start: {},
                      end: {},
                    };
                  }
                  return {
                    start: {
                      line: startLine,
                      column: startColumn,
                    },
                    end: {
                      line: endLine,
                      column: endColumn,
                    },
                  };
                },
              ),
            };
            return acc;
          },
          {},
        ),
      };

      const initCov = genHitByMap(beigin);

      const find = coverageHitQuerySqlResultJson.find(
        (i) => i.relative_path === item.relative_path,
      );

      if (find) {
        const { merged_s, merged_f, merged_b } = find;

        merged_s[0].forEach((j, jindex) => {
          initCov.s[j] = Number(merged_s[1][jindex]);
        });

        merged_f[0].forEach((j, jindex) => {
          initCov.f[j] = Number(merged_f[1][jindex]);
        });

        merged_b[0].forEach((j, jindex) => {
          const realB = decodeKey(j);
          const [a, b] = realB;
          initCov.b[a][b] = Number(merged_b[1][jindex]);
        });
      }

      result[item.relative_path] = {
        ...beigin,
        ...initCov,
      };
    });
    // return result;
    console.log('耗时6：', new Date().getTime() - time6);

    const time7 = new Date().getTime();
    return remapCoverage(result).then((r) => {
      console.log('耗时7：', new Date().getTime() - time7);
      return r;
    });
  }
}

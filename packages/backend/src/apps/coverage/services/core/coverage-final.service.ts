// @ts-nocheck
import { Inject, Injectable } from '@nestjs/common';
import { ClickHouseClient } from '@clickhouse/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { coverageMapQuerySql } from '../../sql/coverage-map-query.sql';
import { coverageHitQuerySql } from '../../sql/coverage-hit-query.sql';
import { genHitByMap } from '../../../../utils/genHitByMap';
import { decodeKey } from '../../../../utils/ekey';
import {
  CoverageHitQuerySqlResultJsonInterface,
  CoverageMapQuerySqlResultJsonInterface,
} from '../../types/coverage-final.types';
import { removeCoverageInstrumentCwd } from '../../../../utils/removeCoverageInstrumentCwd';
import {
  transformCkToCoverageBranchMap,
  transformCkToCoverageFnMap,
  transformCkToCoverageStatementMap,
} from '../../../../utils/transform';
import { remapCoverageWithWindow } from '../../../../utils/remapCoverageWithWindow';

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
    const prismaCoverageFindManyStartTime = new Date().getTime();
    // 第一步：查询coverage表，获取所有的 coverageID。注意，此时不过滤reportProvider和reportID，这一步很关键，因为我们需要获取到所有的文件内容
    const coverages = await this.prisma.coverage.findMany({
      where: {
        provider: provider,
        repoID: repoID,
        sha: sha,
        buildProvider: buildProvider,
        buildID: buildID,
      },
    });

    const prismaCoverageFindMany =
      new Date().getTime() - prismaCoverageFindManyStartTime;

    // 第二步：provider、repoID、sha、buildProvider、buildID确定一组 coverage_map

    const prismaCoverageMapRelationFindManyStartTime = new Date().getTime();
    // TODO coverage_map_relation 表的优化空间是source_map的重复，reportID相同时会重复存
    const coverageMapRelationList =
      await this.prisma.coverageMapRelation.findMany({
        where: {
          coverageID: {
            in: coverages.map((coverage) => coverage.id),
          },
          filePath: filePath,
        },
      });
    const prismaCoverageMapRelationFindMany =
      new Date().getTime() - prismaCoverageMapRelationFindManyStartTime;
    // 以下操作为了去除重复的 coverageMapHashID
    // 构造 hash -> relative_paths[] 映射表
    const hashToPaths = new Map<
      string,
      {
        fullFilePath: string;
      }
    >();
    for (const item of coverageMapRelationList) {
      hashToPaths.set(item.coverageMapHashID, {
        fullFilePath: item.fullFilePath,
      });
    }
    // 查询 ClickHouse：查 hash 对应的 coverage_map
    const deduplicateHashIDList = [
      ...new Set(coverageMapRelationList.map((i) => i.coverageMapHashID)),
    ];
    const ckQuerySqlStart = new Date().getTime();
    const [coverageHitQuerySqlResultJson, coverageMapQuerySqlResultJson] =
      await Promise.all([
        this.clickhouseClient
          .query({
            query: coverageHitQuerySql(coverages, {
              reportProvider,
              reportID,
            }),
            format: 'JSONEachRow',
          })
          .then((r) => r.json<CoverageHitQuerySqlResultJsonInterface>()),
        await this.clickhouseClient
          .query({
            query: coverageMapQuerySql(deduplicateHashIDList),
            format: 'JSONEachRow',
          })
          .then((r) => r.json<CoverageMapQuerySqlResultJsonInterface>()),
      ]);

    const coverageMapQuerySqlResultJsonWithfilePath =
      coverageMapQuerySqlResultJson.map((item) => {
        const relaHashToPaths = hashToPaths.get(item.coverageMapHashID);
        return {
          ...item,
          fullFilePath: relaHashToPaths?.fullFilePath || '',
        };
      });

    const ckQuerySqlCur = new Date().getTime() - ckQuerySqlStart;
    const res = this.mergeCoverageMapAndHitQuerySqlResultsTOIstanbul(
      coverageMapQuerySqlResultJsonWithfilePath,
      coverageHitQuerySqlResultJson,
    );
    const instrumentCwd = coverages[0].instrumentCwd;
    // return res;

    const ddd = removeCoverageInstrumentCwd(res, instrumentCwd);

    const performanceData = {
      time: {
        prismaCoverageFindMany: prismaCoverageFindMany,
        prismaCoverageMapRelationFindMany: prismaCoverageMapRelationFindMany,
        ckQuerySqlCur: ckQuerySqlCur,
        reMapCoverage: 0,
      },
    };

    return {
      performance: {
        time: {
          ...performanceData.time,
        },
      },
      data: filePath
        ? {
            [filePath]: ddd[filePath],
          }
        : ddd,
    };
  }

  //   合并 coverageMapQuerySqlResult、coverageHitQuerySqlResult
  mergeCoverageMapAndHitQuerySqlResultsTOIstanbul(
    coverageMapQuerySqlResultJson: (CoverageMapQuerySqlResultJsonInterface & {
      fullFilePath: string;
    })[],
    coverageHitQuerySqlResultJson: CoverageHitQuerySqlResultJsonInterface[],
  ) {
    const result = {};

    coverageMapQuerySqlResultJson.forEach((item) => {
      const fileCoverageItem = {
        path: item.fullFilePath,
        statementMap: transformCkToCoverageStatementMap(item.statementMap),
        fnMap: transformCkToCoverageFnMap(item.fnMap),
        branchMap: transformCkToCoverageBranchMap(item.branchMap),
      };

      const initCov = genHitByMap(fileCoverageItem);
      const find = coverageHitQuerySqlResultJson
        .filter((i) => i.fullFilePath === item.fullFilePath)
        .reduce(
          (previousValue, currentValue, currentIndex, array) => {
            const { s: s1, f: f1, b: b1 } = currentValue;
            const { s: s2, f: f2, b: b2 } = previousValue;
            const s = [[], []];

            s[0] = [...new Set([...s1[0], ...s2[0]])].sort();

            s[0].forEach((key) => {
              s[1][key] = Number(s1[1][key] || 0) + Number(s2[1][key] || 0);
            });

            const f = [[], []];

            f[0] = [...new Set([...f1[0], ...f2[0]])].sort();

            f[0].forEach((key) => {
              f[1][key] = Number(f1[1][key] || 0) + Number(f2[1][key] || 0);
            });

            const b = [[], []];

            b[0] = [...new Set([...b1[0], ...b2[0]])].sort();

            b[0].forEach((key) => {
              b[1][key] = Number(b1[1][key] || 0) + Number(b2[1][key] || 0);
            });

            return {
              ...previousValue,
              s: s,
              f: f,
              b: b,
            };
          },
          {
            fullFilePath: item.fullFilePath,
            b: [[], []],
            f: [[], []],
            s: [[], []],
          },
        );

      if (find) {
        const { s: merged_s, f: merged_f, b: merged_b } = find;

        merged_s[0].forEach((j: any, jindex) => {
          initCov.s[j] = Number(merged_s[1][jindex]);
        });

        merged_f[0].forEach((j: any, jindex) => {
          initCov.f[j] = Number(merged_f[1][jindex]);
        });

        merged_b[0].forEach((j: any, jindex) => {
          const realB = decodeKey(j);
          const [a, b] = realB;
          const realB1 = Number(merged_b[1][jindex]);
          initCov.b[a][b] = isNaN(realB1) ? 0 : Number(realB1);
        });
      }

      result[item.fullFilePath] = {
        ...fileCoverageItem,
        ...initCov,
      };
    });
    return result;
  }
}

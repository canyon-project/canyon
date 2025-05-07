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
      data: ddd,
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

      const find = coverageHitQuerySqlResultJson.find(
        (i) => i.fullFilePath === item.fullFilePath,
      );

      if (find) {
        const { s: merged_s, f: merged_f, b: merged_b } = find;

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

      result[item.fullFilePath] = {
        ...fileCoverageItem,
        ...initCov,
      };
    });
    return result;
  }
}

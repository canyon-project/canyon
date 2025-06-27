// @ts-nocheck
import { Inject, Injectable } from '@nestjs/common';
import { ClickHouseClient } from '@clickhouse/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { coverageMapQuerySql } from '../../sql/coverage-map-query.sql';
import { coverageHitQuerySql, coverageHitQuerySqlParallel } from '../../sql/coverage-hit-query.sql';
import { genHitByMap } from '../../../../utils/genHitByMap';
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
import {
  convertClickHouseCoverageToIstanbul,
  fuzhi,
} from '../../helpers/coverage';

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
      await this.prisma.coverageMapRelation.groupBy({
        by: ['coverageMapHashID', 'fullFilePath'],
        where: {
          coverageID: {
            in: coverages.map((coverage) => coverage.id),
          },
          filePath: filePath,
        },
      });
    const prismaCoverageMapRelationFindMany =
      new Date().getTime() - prismaCoverageMapRelationFindManyStartTime;
    // 查询 ClickHouse：查 hash 对应的 coverage_map

    const deduplicateHashIDList = coverageMapRelationList.map(
      (i) => i.coverageMapHashID,
    );
    const ckQuerySqlStart = new Date().getTime();

    // 使用并行查询替代单个大查询
    const coverageHitQuerySqls = coverageHitQuerySqlParallel(coverages, {
      reportProvider,
      reportID,
    }, 100); // 每批100个coverage_id

    const [coverageHitQuerySqlResultJson, coverageMapQuerySqlResultJson] =
      await Promise.all([
        // 并行执行多个小的查询
        Promise.all(
          coverageHitQuerySqls.map(sql =>
            this.clickhouseClient
              .query({
                query: sql,
                format: 'JSONEachRow',
              })
              .then((r) => r.json<CoverageHitQuerySqlResultJsonInterface>())
          )
        ).then(results => results.flat()), // 合并所有查询结果
        await this.clickhouseClient
          .query({
            query: coverageMapQuerySql(deduplicateHashIDList),
            format: 'JSONEachRow',
          })
          .then((r) => r.json<CoverageMapQuerySqlResultJsonInterface>()),
      ]);

    const coverageMapQuerySqlResultJsonWithfilePath =
      coverageMapRelationList.map((i) => {
        const sss = coverageMapQuerySqlResultJson.find(
          (j) => j.coverageMapHashID === i.coverageMapHashID,
        );
        return {
          ...sss,
          fullFilePath: i.fullFilePath,
        };
      });
    const ckQuerySqlCur = new Date().getTime() - ckQuerySqlStart;
    const res = this.mergeCoverageMapAndHitQuerySqlResultsTOIstanbul(
      coverageMapQuerySqlResultJsonWithfilePath,
      coverageHitQuerySqlResultJson,
    );
    const instrumentCwd = coverages[0].instrumentCwd;

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
      const find = convertClickHouseCoverageToIstanbul(
        coverageHitQuerySqlResultJson.filter(
          (i) => i.fullFilePath === item.fullFilePath,
        ),
        item.fullFilePath,
      );
      if (find) {
        result[item.fullFilePath] = {
          ...fileCoverageItem,
          ...fuzhi(find, initCov),
          path: item.fullFilePath,
        };
      } else {
        result[item.fullFilePath] = {
          ...fileCoverageItem,
          ...initCov,
          path: item.fullFilePath,
        };
      }
    });
    return result;
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CoverageClientDto } from '../dto/coverage-client.dto';
import { generateCoverageId } from '../../../utils/generateCoverageId';
import { ClickHouseClient } from '@clickhouse/client';
import { CoverageQueryParams } from '../../../types/coverage';
import {
  getBranchTypeByIndex,
  getBranchTypeIndex,
} from '../../../utils/getBranchType';
import { encodeKey, flattenBranchMap } from 'src/utils/ekey';
import { createHash } from 'crypto';
import { gzipSync } from 'zlib';
import { remapCoverage, remapCoverageByOld } from 'canyon-map';
import * as fs from 'node:fs';
import {
  transformCoverageBranchMapToCk,
  transformCoverageFnMapToCk,
  transformCoverageStatementMapToCk,
} from '../../../utils/transform';
import { transFormHash } from '../../../utils/hash';
import { checkCoverageType } from '../../../utils/checkCoverageType';

// 整体思路改动！！！！！
// 整体思路改动！！！！！
// 整体思路改动！！！！！
// 整体思路改动！！！！！
// 整体思路改动！！！！！
// 整体思路改动！！！！！
// 整体思路改动！！！！！

// 先remap成规整的 ！

// 全部组合成最终形态

// const data = {
//   relativePath: '/coverage',
//   statementMap: {},
//   noTransformStatementMap: {},
//   s: {},
//   f: {},
// };

// 分组，db查询

// 此代码重中之重、核心中的核心！！！
@Injectable()
export class CoverageClientService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('CLICKHOUSE_CLIENT')
    private readonly clickhouseClient: ClickHouseClient,
  ) {}
  async invoke(
    reporter: string,
    {
      provider,
      sha,
      repoID,
      coverage,
      instrumentCwd,
      reportID, // 可选
      branch, // 可选
      compareTarget, //可选
      buildID, // 可选
      buildProvider, // 可选
      reportProvider, // 可选
    }: CoverageClientDto,
  ) {
    const coverageID = generateCoverageId({
      provider,
      sha,
      repoID,
      reportID,
      buildID,
      buildProvider,
      reportProvider,
    });

    // 1. 检查coverage类型
    const coverageType = checkCoverageType(coverage);

    const findCoverage = await this.prisma.coverage.findUnique({
      where: {
        id: coverageID,
      },
    });

    // review过了
    if (coverageType === 'hit' && findCoverage === null) {
      return {
        type: coverageType, // hit or map
        coverageTable: findCoverage,
      };
    }

    if (coverageType === 'hit') {
      // 很有必要，因为绝大部分都是没有inputSourceMap的，90%以上，所以多一个inputSourceMap的标志，可以通过fiter判断是否要反查询，可以大大减少查询的数量
      // TODO 暂定，字段名就叫 inputSourceMap 当是hit的时候，跟着bfs一起传，有才传，即1
      // 如果有hit的话我肯定得查。
      // this.prisma.coverageMapRelation.findMany();
      // this.prisma.coverageSourceMap.findMany();
      // 组合出原始map
      // 有findCoverage，基本上肯定是有coverageMapRelation了
      // if (isHas > 0) {
      //   // 如果sourceMapID有，那就是最复杂的情况
      //   // 有hit且，且需要sm，且有，那就最复杂的情况
      // } else {
      //   // 说明没有sourceMap，要报错，不能用
      //   console.log('没有sourceMap');
      // }

      // 组合
      // this.prisma.coverageMapRelation.findMany();
      // this.prisma.coverageSourceMap.findMany();

      // const genCov = fn();
      //
      // this.insertCoverageIntoDatabase(genCov);

      if (
        Object.values(coverage as CoverageQueryParams).filter(
          (i) => i.inputSourceMap,
        ).length > 0
      ) {
        const coverageMapRelationList =
          await this.prisma.coverageMapRelation.findMany({
            where: {},
          });
        this.clickhouseClient.query(``);

        const hechengCov = {};

        const remapCoverageObject = await remapCoverage(hechengCov);

        const re2 = await this.coverageHitInsertResult(
          coverageID,
          remapCoverageObject,
        );

        return {};

        //   reMap后慢慢处理
      } else {
        //   直接插入hit了这边，不需要其他操作了应该？
        const coverageHitInsertResult = await this.coverageHitInsertResult(
          coverageID,
          coverage,
        );
        return {
          type: coverageType, // hit or map
          coverageTable: findCoverage,
          coverageHitInsertResult: coverageHitInsertResult,
        };
      }
    } else {
      //   如果是map的话，那逻辑就一样了

      // 不管怎么样，先插入
      const coverageID = generateCoverageId({
        provider,
        sha,
        repoID,
        reportID,
        buildID,
        buildProvider,
        reportProvider,
      });

      await this.prisma.coverage
        .create({
          data: {
            id: coverageID,
            sha, // 定
            repoID, // 定
            // coverage: {},
            instrumentCwd, // 定
            reportID: reportID,
            reportProvider: reportProvider,
            branch, // 定
            compareTarget,
            reporter: '1',
            buildID,
            buildProvider,
            scopeID: '2',
            provider: provider,
          },
        })
        .catch(() => {
          // console.log(r)
        });

      //   检查要不要reMap
      if (
        Object.values(coverage as CoverageQueryParams).filter(
          (i) => i.inputSourceMap,
        ).length > 0
      ) {
        console.log('需要reMap');
        // 还原覆盖率
        const remapCoverageObject = await remapCoverageByOld(coverage);

        const mapList = this.genMapList(remapCoverageObject, coverage);
        console.log(mapList, 'mapList');
        const re1 = await this.coverageMapInsertResult(mapList);
        // 封装**
        const re2 = await this.coverageHitInsertResult(
          coverageID,
          remapCoverageObject,
        );

        return {
          re1,
          re2,
        };
      } else {
        const mapList = this.genMapList(coverage);
        await this.coverageMapInsertResult(mapList);
        // 封装**
        await this.coverageHitInsertResult(coverageID, coverage);
      }
    }

    // await this.insertCoverageIntoDatabase();

    return {
      type: coverageType, // hit or map
      coverageTable: findCoverage,
    };
  }
  async insertCoverageIntoDatabase() {
    // this.clickhouseClient
    // this.prisma.coverageMapRelation
    // this.prisma.coverageSourceMap

    return {};
  }

  async coverageHitInsertResult(coverageID: string, coverage) {
    return this.clickhouseClient.insert({
      table: 'coverage_hit',
      values: Object.values(coverage as CoverageQueryParams).map(
        ({ s, path, f, b }) => {
          return {
            ts: Math.floor(new Date().getTime() / 1000),
            coverage_id: coverageID, // 这里的hash_id是 coverageID，保证reportID维度的不重复
            relative_path: path,
            s: s,
            f: f,
            b: flattenBranchMap(b),
          };
        },
      ),
      format: 'JSONEachRow',
    });
  }

  async coverageMapInsertResult(mapList) {
    //   才需要插入map表
    return this.clickhouseClient.insert({
      table: 'coverage_map',
      values: mapList.map((m) => ({
        ts: Math.floor(new Date().getTime() / 1000),
        hash: m.file_coverage_map_hash,
        // input_source_map: m.input_source_map,
        statement_map: m.statement_map,
        fn_map: m.fn_map,
        branch_map: m.branch_map,
        no_transform_statement_map: m.no_transform_statement_map,
        no_transform_fn_map: m.no_transform_fn_map,
        no_transform_branch_map: m.no_transform_branch_map,
      })),
      format: 'JSONEachRow',
    });
  }

  genMapList(coverage, noTransformCoverage?) {
    if (noTransformCoverage) {
    }

    const mapList = Object.values(coverage as CoverageQueryParams)
      .filter(
        ({ statementMap, branchMap, fnMap }) =>
          statementMap && branchMap && fnMap,
      )
      .map(
        ({ statementMap, branchMap, fnMap, inputSourceMap, path, oldPath }) => {
          const source_map_hash_id = inputSourceMap
            ? createHash('sha256')
                .update(JSON.stringify(inputSourceMap))
                .digest('hex')
            : '';

          const noTransformCovItem: any = Object.values(
            noTransformCoverage,
          ).find((i: any) => i.path === oldPath);

          const map = noTransformCovItem
            ? {
                no_transform_statement_map: transformCoverageStatementMapToCk(
                  noTransformCovItem.statementMap,
                ),
                no_transform_fn_map: transformCoverageFnMapToCk(
                  noTransformCovItem.fnMap,
                ),
                no_transform_branch_map: transformCoverageBranchMapToCk(
                  noTransformCovItem.branchMap,
                ),
              }
            : {};

          const mapItem = {
            relative_path: path,
            source_map_hash_id: source_map_hash_id,
            source_map: JSON.stringify(inputSourceMap),
            statement_map: transformCoverageStatementMapToCk(statementMap),
            fn_map: transformCoverageFnMapToCk(fnMap),
            branch_map: transformCoverageBranchMapToCk(branchMap),
            ...map,
          };

          // 查找，如果存在才加上

          const file_coverage_map_hash = createHash('sha256')
            .update(
              JSON.stringify({
                statement_map: mapItem.statement_map,
                fn_map: mapItem.fn_map,
                branch_map: mapItem.branch_map,
              }),
            )
            .digest('hex');

          return {
            ...mapItem,
            file_coverage_map_hash, // 增加hash字段
          };
        },
      );

    return mapList;
  }
}

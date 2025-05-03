import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CoverageClientDto } from '../dto/coverage-client.dto';
import { generateCoverageId } from '../../../utils/generateCoverageId';
import { ClickHouseClient } from '@clickhouse/client';
import { CoverageQueryParams } from '../../../types/coverage';
import { flattenBranchMap } from 'src/utils/ekey';
import { createHash } from 'crypto';
import { remapCoverage, remapCoverageByOld } from 'canyon-map';
import {
  decodeCompressedObject,
  transformCkToCoverageBranchMap,
  transformCkToCoverageFnMap,
  transformCkToCoverageStatementMap,
  transformCoverageBranchMapToCk,
  transformCoverageFnMapToCk,
  transformCoverageStatementMapToCk,
} from '../../../utils/transform';
import { checkCoverageType } from '../../../utils/checkCoverageType';
import { coverageMapQuerySql } from '../sql/coverage-map-query.sql';
import { CoverageMapQuerySqlResultJsonInterface } from '../types/coverage-final.types';
import { reorganizeCompleteCoverageObjects } from '../../../utils/canyon-map';
import { gzipSync } from 'zlib';

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
      buildID,
      buildProvider,
      reportID,
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
      if (
        Object.values(coverage as CoverageQueryParams).filter(
          (i) => i.inputSourceMap,
        ).length > 0
      ) {
        // 最复杂的地方
        const needRemapCoverage = await this.genCoverageHitMap(
          coverageID,
          coverage,
        );

        const remapCoverageObject = await remapCoverage(needRemapCoverage);
        console.log(remapCoverageObject,'remapCoverageObject')
        // console.log(remapCoverageObject,'remapCoverageObject')
        const re2 = await this.coverageHitInsertResult(
          coverageID,
          remapCoverageObject,
        );

        return { re2 };

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
        // 还原覆盖率
        const remapCoverageObject = await remapCoverageByOld(coverage);

        const mapList = this.genMapList(remapCoverageObject, coverage);
        const re1 = await this.coverageMapInsertResult(mapList);
        // 封装**
        const re2 = await this.coverageHitInsertResult(
          coverageID,
          remapCoverageObject,
        );

        await this.coverageRelationAndMap(coverageID, mapList);

        return {
          re1,
          re2,
        };
      } else {
        const mapList = this.genMapList(coverage);
        await this.coverageMapInsertResult(mapList);
        // 封装**
        await this.coverageHitInsertResult(coverageID, coverage);

        await this.coverageRelationAndMap(coverageID, mapList);
      }
    }

    return {
      type: coverageType, // hit or map
      coverageTable: findCoverage,
    };
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
    const mapList = Object.values(coverage as CoverageQueryParams)
      .filter(
        ({ statementMap, branchMap, fnMap }) =>
          statementMap && branchMap && fnMap,
      )
      .map(({ statementMap, branchMap, fnMap, path, oldPath }) => {
        // console.log(inputSourceMap,'inputSourceMap')
        const noTransformCovItem: any = Object.values(noTransformCoverage).find(
          (i: any) => i.path === oldPath,
        );
        const inputSourceMap = noTransformCovItem.inputSourceMap;
        // console.log(noTransformCovItem,'noTransformCovItem')
        const source_map_hash_id = inputSourceMap
          ? createHash('sha256')
              .update(JSON.stringify(inputSourceMap))
              .digest('hex')
          : '';
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
              no_transform_relative_path: oldPath,
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
        // console.log(statementMap,'statementMap',noTransformCovItem.statementMap,'noTransformCovItem.statementMap')
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
      });

    return mapList;
  }

  async genCoverageHitMap(coverageID: string, noReMapHit) {
    const coverageMapRelationList =
      await this.prisma.coverageMapRelation.findMany({
        where: {
          coverageID,
        },
      });

    const allcoverageSourceMapList =
      await this.prisma.coverageSourceMap.findMany({
        where: {
          hash: {
            in: coverageMapRelationList.map((m) => m.sourceMapHashID),
          },
        },
      });

    const deduplicateHashIDList = coverageMapRelationList.map((i) => i.hashID);

    const coverageMapQuerySqlResultJson = await this.clickhouseClient
      .query({
        query: coverageMapQuerySql([...new Set(deduplicateHashIDList)]),
        format: 'JSONEachRow',
      })
      .then((r) => r.json<CoverageMapQuerySqlResultJsonInterface>());

    const result = {};

    coverageMapQuerySqlResultJson.forEach((item) => {
      const hash = item.hash;

      const coverageMapRelationItem = coverageMapRelationList.find(
        (i) => i.hashID === hash,
      );

      if (coverageMapRelationItem) {
        const source = allcoverageSourceMapList.find(
          (j) => j.hash === coverageMapRelationItem.sourceMapHashID,
        );

        const inputSourceMap = source
          ? decodeCompressedObject(source.sourceMap)
          : undefined;

        const beigin = {
          path: coverageMapRelationItem?.noTransformRelativePath,
          statementMap: transformCkToCoverageStatementMap(
            item.no_transform_statement_map,
          ),
          fnMap: transformCkToCoverageFnMap(item.no_transform_fn_map),
          branchMap: transformCkToCoverageBranchMap(
            item.no_transform_branch_map,
          ),
          inputSourceMap: inputSourceMap,
        };
        result[coverageMapRelationItem?.noTransformRelativePath] = beigin;
      }
    });

    return reorganizeCompleteCoverageObjects(result, noReMapHit);
  }

  async coverageRelationAndMap(coverageID, mapList) {
    // 插入 coverage_map_relation 表（当前 coverageID 所关联的 hash）
    await this.prisma.coverageMapRelation.createMany({
      data: mapList.map((m) => ({
        id: coverageID + '|' + m.relative_path,
        hashID: m.file_coverage_map_hash,
        absolutePath: m.relative_path,
        relativePath: m.relative_path,
        noTransformRelativePath: m.no_transform_relative_path,
        coverageID,
        sourceMapHashID: m.source_map_hash_id,
      })),
      skipDuplicates: true,
    });

    await this.prisma.coverageSourceMap.createMany({
      data: mapList.map((m) => ({
        hash: m.source_map_hash_id,
        sourceMap: gzipSync(Buffer.from(m.source_map)),
      })),
      skipDuplicates: true,
    });
  }
}

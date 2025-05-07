import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CoverageClientDto } from '../dto/coverage-client.dto';
import { generateCoverageId } from '../../../utils/generateCoverageId';
import { ClickHouseClient } from '@clickhouse/client';
import { CoverageQueryParams } from '../../../types/coverage';
import { flattenBranchMap } from 'src/utils/ekey';
import { remapCoverage, remapCoverageByOld } from 'canyon-map';
import {
  decodeCompressedObject,
  encodeObjectToCompressedBuffer,
  transformCkToCoverageBranchMap,
  transformCkToCoverageFnMap,
  transformCkToCoverageStatementMap,
  transformCoverageBranchMapToCk,
  transformCoverageFnMapToCk,
  transformCoverageStatementMapToCk,
} from '../../../utils/transform';
import { checkCoverageType } from '../helpers/checkCoverageType';
import { coverageMapQuerySql } from '../sql/coverage-map-query.sql';
import { CoverageMapQuerySqlResultJsonInterface } from '../types/coverage-final.types';
import { reorganizeCompleteCoverageObjects } from '../../../utils/canyon-map';
import { transFormHash } from '../../../utils/hash';

// 核心逻辑，需要用buildID获取所有关联的map，而不是单纯的通过coverageId获取到的
@Injectable()
export class CoverageClientService {
  private producerQueue: any[] = [];
  private consumerQueue: any[] = [];
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
      reportID, // Option
      branch, // Option
      compareTarget, // Option
      buildID, // Option
      buildProvider, // Option
      reportProvider, // Option
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

    // 这里的逻辑需要改，应该是检查是否有相同buildID的

    const coverageList = await this.prisma.coverage.findMany({
      where: {
        provider,
        sha,
        repoID,
        buildID,
        buildProvider,
      },
    });

    // review过了
    if (coverageType === 'hit' && coverageList.length === 0) {
      return {
        type: coverageType, // hit or map
        coverageTable: coverageList,
      };
    }

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

    if (coverageType === 'hit') {
      if (
        Object.values(coverage as CoverageQueryParams).filter(
          (i) => i.inputSourceMap,
        ).length > 0
      ) {
        // 最复杂的地方
        const needRemapCoverage = await this.genCoverageHitMap(
          coverageList.map((coverage) => coverage.id),
          coverage,
        );

        const remapCoverageObject = await remapCoverage(needRemapCoverage);
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
          coverageTable: coverageList,
          coverageHitInsertResult: coverageHitInsertResult,
        };
      }
    } else {
      //   检查要不要reMap
      if (
        Object.values(coverage as CoverageQueryParams).filter(
          (i) => i.inputSourceMap,
        ).length > 0
      ) {
        // 还原覆盖率
        const remapCoverageObject = await remapCoverageByOld(coverage);

        const mapList: any[] = this.genMapList(
          instrumentCwd,
          remapCoverageObject,
          coverage,
        );
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
        const mapList: any[] = this.genMapList(instrumentCwd, coverage);
        await this.coverageMapInsertResult(mapList);
        await this.coverageHitInsertResult(coverageID, coverage);
        await this.coverageRelationAndMap(coverageID, mapList);
      }
    }

    return {
      type: coverageType, // hit or map
      coverageTable: coverageList,
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
            full_file_path: path,
            s: s,
            f: f,
            b: flattenBranchMap(b),
          };
        },
      ),
      format: 'JSONEachRow',
    });
  }

  async coverageMapInsertResult(
    mapList: CoverageMapQuerySqlResultJsonInterface[],
  ) {
    //   才需要插入map表
    return this.clickhouseClient.insert({
      table: 'coverage_map',
      values: mapList.map(
        ({
          coverageMapHashID,
          statementMap,
          fnMap,
          branchMap,
          restoreStatementMap,
          restoreFnMap,
          restoreBranchMap,
        }) => ({
          ts: Math.floor(new Date().getTime() / 1000),
          hash: coverageMapHashID,
          statement_map: statementMap,
          fn_map: fnMap,
          branch_map: branchMap,
          restore_statement_map: restoreStatementMap,
          restore_fn_map: restoreFnMap,
          restore_branch_map: restoreBranchMap,
        }),
      ),
      format: 'JSONEachRow',
    });
  }

  genMapList(instrumentCwd, coverage, restoreCoverage?) {
    const mapList = Object.values(coverage as CoverageQueryParams)
      .filter(
        ({ statementMap, branchMap, fnMap }) =>
          statementMap && branchMap && fnMap,
      )
      .map(({ statementMap, branchMap, fnMap, path, oldPath }) => {
        let map = {};
        if (restoreCoverage) {
          const noTransformCovItem: any = Object.values(
            restoreCoverage as CoverageQueryParams,
          ).find((i: any) => i.path === oldPath);

          if (noTransformCovItem) {
            const inputSourceMap = noTransformCovItem?.inputSourceMap;

            const sourceMapHashID = inputSourceMap
              ? transFormHash(inputSourceMap)
              : '';
            map = noTransformCovItem
              ? {
                  restoreStatementMap: transformCoverageStatementMapToCk(
                    noTransformCovItem.statementMap,
                  ),
                  restoreFnMap: transformCoverageFnMapToCk(
                    noTransformCovItem.fnMap,
                  ),
                  restoreBranchMap: transformCoverageBranchMapToCk(
                    noTransformCovItem.branchMap,
                  ),
                  restoreFullFilePath: oldPath,
                  sourceMapHashID,
                  sourceMap: inputSourceMap,
                }
              : {};
          }
        }

        const mapItem = {
          fullFilePath: path,
          filePath: path.replaceAll(instrumentCwd + '/', ''),
          statementMap: transformCoverageStatementMapToCk(statementMap),
          fnMap: transformCoverageFnMapToCk(fnMap),
          branchMap: transformCoverageBranchMapToCk(branchMap),
          ...map,
          //  map是可能有的，关于sourceMap的数据
        };

        const coverageMapHashID = transFormHash({
          statementMap: mapItem.statementMap,
          fnMap: mapItem.fnMap,
          branchMap: mapItem.branchMap,
        });

        return {
          ...mapItem,
          coverageMapHashID, // 增加hash字段
        };
      });

    return mapList;
  }

  async genCoverageHitMap(coverageIDList: string[], noReMapHit) {
    /*
    这里是关键
    1. coverageIDList 这个是相同buildID的集合，通过它筛选出来的coverageMapRelationList是全量的
    2. 通过groupBy去重筛选出所有的文件路径
    */
    const coverageMapRelationList =
      await this.prisma.coverageMapRelation.groupBy({
        by: ['coverageMapHashID', 'sourceMapHashID', 'restoreFullFilePath'],
        where: {
          coverageID: {
            in: coverageIDList,
          },
        },
      });

    const sourceMapList = await this.prisma.coverageSourceMap.findMany({
      where: {
        hash: {
          in: coverageMapRelationList.map(
            ({ sourceMapHashID }) => sourceMapHashID,
          ),
        },
      },
    });

    const coverageMapQuerySqlResultJson = await this.clickhouseClient
      .query({
        query: coverageMapQuerySql(
          coverageMapRelationList.map(
            ({ coverageMapHashID }) => coverageMapHashID,
          ),
        ),
        format: 'JSONEachRow',
      })
      .then((r) => r.json<CoverageMapQuerySqlResultJsonInterface>());

    const allFileCoverage = {};

    coverageMapQuerySqlResultJson.forEach((item) => {
      const coverageMapHashID = item.coverageMapHashID;

      const coverageMapRelationItem = coverageMapRelationList.find(
        (i) => i.coverageMapHashID === coverageMapHashID,
      );

      if (coverageMapRelationItem) {
        const sourceMap = sourceMapList.find(
          (j) => j.hash === coverageMapRelationItem.sourceMapHashID,
        );

        const inputSourceMap = sourceMap
          ? decodeCompressedObject(sourceMap.sourceMap)
          : undefined;

        const fileCoverage = {
          path: coverageMapRelationItem.restoreFullFilePath,
          statementMap: transformCkToCoverageStatementMap(
            item.restoreStatementMap,
          ),
          fnMap: transformCkToCoverageFnMap(item.restoreFnMap),
          branchMap: transformCkToCoverageBranchMap(item.restoreBranchMap),
          inputSourceMap: inputSourceMap,
        };
        allFileCoverage[coverageMapRelationItem.restoreFullFilePath] =
          fileCoverage;
      }
    });

    // TODO 0504凌晨1点，这里需要把sourceMap的值也加上去
    return reorganizeCompleteCoverageObjects(allFileCoverage, noReMapHit);
  }

  async coverageRelationAndMap(
    coverageID: string,
    mapList: {
      coverageMapHashID: string;
      sourceMapHashID: string;
      restoreFullFilePath: string;
      filePath: string;
      fullFilePath: string;
      sourceMap: any;
    }[],
  ) {
    // 插入 coverage_map_relation 表（当前 coverageID 所关联的 hash）
    await this.prisma.coverageMapRelation.createMany({
      data: mapList.map(
        ({
          coverageMapHashID,
          sourceMapHashID,
          restoreFullFilePath,
          filePath,
          fullFilePath,
        }) => ({
          id: coverageID + '|' + filePath,
          coverageMapHashID: coverageMapHashID,
          fullFilePath: fullFilePath,
          filePath: filePath,
          restoreFullFilePath: restoreFullFilePath || '',
          coverageID,
          sourceMapHashID: sourceMapHashID || '',
        }),
      ),
      skipDuplicates: true,
    });

    await this.prisma.coverageSourceMap.createMany({
      data: mapList
        .filter(({ sourceMapHashID }) => sourceMapHashID)
        .map(({ sourceMapHashID, sourceMap }) => ({
          hash: sourceMapHashID,
          sourceMap: encodeObjectToCompressedBuffer(sourceMap),
        })),
      skipDuplicates: true,
    });
  }
}

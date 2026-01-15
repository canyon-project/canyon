import { Injectable } from '@nestjs/common';
import { remapCoverageByOld } from '../../collect/helpers/canyon-data';
import { decodeCompressedObject } from '../../collect/helpers/transform';
import {
  addMaps,
  ensureNumMap,
  NumMap,
} from '../../helpers/coverage-merge.util';
import { testExclude } from '../../helpers/test-exclude';
import { PrismaService } from '../../prisma/prisma.service';
import { CoverageQueryParamsTypes } from '../types/coverage-query-params.types';

/*
此服务是基本覆盖率查询服务，保持手作
手作りにこだわる
*/

@Injectable()
export class CoverageMapForCommitService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 将 key-value 格式的 scene 对象转换为 Prisma JSON 查询条件
   * @param scene - JSON 字符串，格式为 { key1: 'value1', key2: 'value2' }
   * @returns Prisma JSON 查询条件
   */
  private buildSceneQueryCondition(scene?: string) {
    if (!scene) {
      return undefined;
    }

    try {
      const sceneObj = JSON.parse(scene);

      // 如果解析后不是对象，返回 undefined
      if (
        typeof sceneObj !== 'object' ||
        sceneObj === null ||
        Array.isArray(sceneObj)
      ) {
        return undefined;
      }

      // 获取所有 key-value 对
      const entries = Object.entries(sceneObj);

      // 如果没有键值对，返回 undefined
      if (entries.length === 0) {
        return undefined;
      }

      // 如果只有一个键值对，直接返回单个查询条件
      if (entries.length === 1) {
        const [key, value] = entries[0];
        return {
          path: [key],
          equals: String(value), // 确保 value 是字符串
        };
      }

      // 如果有多个键值对，使用 AND 条件
      return {
        AND: entries.map(([key, value]) => ({
          path: [key],
          equals: String(value), // 确保 value 是字符串
        })),
      };
    } catch {
      // JSON 解析失败，返回 undefined
      return undefined;
    }
  }

  async invoke({
    provider,
    repoID,
    sha,
    buildTarget,
    filePath,
    scene,
  }: CoverageQueryParamsTypes) {
    // #region Step 1: 查询覆盖率记录并获取基础信息
    const coverageWhereCondition: any = {
      provider,
      repoID,
      sha,
      buildTarget,
    };

    // 构建 scene 查询条件
    const sceneCondition = this.buildSceneQueryCondition(scene);
    if (sceneCondition) {
      coverageWhereCondition.scene = sceneCondition;
    }

    const coverageRecords = await this.prisma.coverage.findMany({
      where: coverageWhereCondition,
    });
    if (coverageRecords.length === 0) {
      return {
        success: false,
        message: 'No coverage records found for the specified commit.',
      };
    }

    // 收集所有匹配记录的 sceneKey
    const sceneKeys = new Set<string>();
    for (const record of coverageRecords) {
      sceneKeys.add(record.sceneKey);
    }

    const coverageRecord = coverageRecords[0];
    const { instrumentCwd, buildHash } = coverageRecord;
    const instrumentCwdPrefix = instrumentCwd + '/';
    // #endregion

    // #region Step 2: 查询覆盖率映射关系
    const mapRelationWhereCondition: {
      buildHash: string;
      fullFilePath?: string;
    } = {
      buildHash,
    };

    // 如果 filePath 存在，则添加 fullFilePath 查询条件
    if (filePath) {
      const fullFilePath = instrumentCwdPrefix + filePath;
      mapRelationWhereCondition.fullFilePath = fullFilePath;
    }

    const mapRelations = await this.prisma.coverageMapRelation.findMany({
      where: mapRelationWhereCondition,
    });

    if (mapRelations.length === 0) {
      return {
        success: false,
        message: 'No coverage map relations found for the specified criteria.',
      };
    }
    // #endregion

    // #region Step 3: 构建索引并查询源映射与覆盖率映射数据
    // 使用 Set 去重，然后构建 Map 提高查找性能
    const sourceMapHashSet = new Set<string>();
    const coverageMapHashKeySet = new Set<string>();
    for (const relation of mapRelations) {
      sourceMapHashSet.add(relation.sourceMapHash);
      coverageMapHashKeySet.add(
        `${relation.coverageMapHash}|${relation.fileContentHash}`,
      );
    }

    // 并行查询，使用 Map 存储结果
    const [sourceMaps, coverageMaps] = await Promise.all([
      this.prisma.coverageSourceMap.findMany({
        where: {
          hash: { in: Array.from(sourceMapHashSet) },
        },
      }),
      this.prisma.coverageMap.findMany({
        where: {
          hash: { in: Array.from(coverageMapHashKeySet) },
        },
      }),
    ]);

    // 构建 Map 索引，避免循环中的 find 操作
    const sourceMapIndex = new Map<string, (typeof sourceMaps)[0]>();
    for (const sourceMap of sourceMaps) {
      sourceMapIndex.set(sourceMap.hash, sourceMap);
    }

    const coverageMapIndex = new Map<string, (typeof coverageMaps)[0]>();
    for (const coverageMap of coverageMaps) {
      coverageMapIndex.set(coverageMap.hash, coverageMap);
    }
    // #endregion

    // #region Step 4: 构建文件覆盖率映射
    // 使用 Map 存储文件覆盖率映射，后续查找更快
    const fileCoverageMap = new Map<string, any>();

    for (const relation of mapRelations) {
      const rawFilePath = relation.restoreFullFilePath || relation.fullFilePath;
      const sourceMapRecord = sourceMapIndex.get(relation.sourceMapHash);
      const coverageMapKey = `${relation.coverageMapHash}|${relation.fileContentHash}`;
      const coverageMapRecord = coverageMapIndex.get(coverageMapKey);
      if (!coverageMapRecord) continue;

      // 这里不能用restore是否存在来判断，因为他是{}
      const decodedCoverageMap = sourceMapRecord
        ? decodeCompressedObject(coverageMapRecord.origin)
        : decodeCompressedObject(coverageMapRecord.restore);
      fileCoverageMap.set(rawFilePath, {
        path: rawFilePath,
        ...decodedCoverageMap,
        inputSourceMap: sourceMapRecord
          ? decodeCompressedObject(sourceMapRecord.sourceMap)
          : undefined,
      });
    }

    if (fileCoverageMap.size === 0) {
      return {
        success: false,
        message: 'No valid coverage maps found after processing relations.',
      };
    }
    // #endregion

    // #region Step 5: 查询并聚合覆盖率命中数据
    // 构建 coverageHit 查询条件
    const coverageHitWhereCondition: any = {
      buildHash,
    };

    // 如果通过 scene 筛选出了 coverage 记录，使用这些记录的 sceneKey 列表来筛选 coverageHit
    if (sceneKeys.size > 0) {
      coverageHitWhereCondition.sceneKey = {
        in: Array.from(sceneKeys),
      };
    }

    // 查询所有相同 buildHash（和 sceneKey 列表，如果通过 scene 筛选）的覆盖率命中数据
    const coverageHits = await this.prisma.coverageHit.findMany({
      where: coverageHitWhereCondition,
    });

    // 直接按 rawFilePath 聚合所有 hit 数据（不区分 sceneKey）
    const aggregatedHitDataByFile = new Map<
      string,
      {
        s: NumMap;
        f: NumMap;
      }
    >();

    for (const coverageHit of coverageHits) {
      // 获取或创建 rawFilePath 的聚合数据
      if (!aggregatedHitDataByFile.has(coverageHit.rawFilePath)) {
        aggregatedHitDataByFile.set(coverageHit.rawFilePath, {
          s: {},
          f: {},
        });
      }

      const fileHitData = aggregatedHitDataByFile.get(coverageHit.rawFilePath)!;
      // 合并 s, f 字段（跨所有 sceneKey 聚合）
      fileHitData.s = addMaps(fileHitData.s, ensureNumMap(coverageHit.s));
      fileHitData.f = addMaps(fileHitData.f, ensureNumMap(coverageHit.f));
    }
    // #endregion

    // #region Step 6: 合并覆盖率映射和命中数据
    // 将 hit 数据与文件覆盖率映射重组
    // 只保留同时有 map 和 hit 的 rawFilePath
    const mergedCoverageData: Record<string, any> = {};

    // 遍历文件覆盖率映射中的所有文件，只保留同时有 map 和 hit 的文件
    for (const [
      rawFilePath,
      fileCoverageMapData,
    ] of fileCoverageMap.entries()) {
      // 获取该 rawFilePath 对应的聚合 hit 数据
      const fileHitData = aggregatedHitDataByFile.get(rawFilePath);

      // 只保留同时有 map 和 hit 的文件
      if (fileHitData) {
        // 合并 map 结构和 hit 数据
        mergedCoverageData[rawFilePath] = {
          ...fileCoverageMapData,
          s: fileHitData.s,
          f: fileHitData.f,
          b: {},
          branchMap: {},
        };
      }
    }
    if (Object.keys(mergedCoverageData).length === 0) {
      return {
        success: false,
        message:
          'No coverage data could be merged after combining maps and hits.',
      };
    }
    // #endregion

    // #region Step 7: 重新映射覆盖率数据
    const remappedCoverage = await remapCoverageByOld(mergedCoverageData);
    // #endregion

    // #region Step 8: 标准化路径并过滤最终结果
    // 替换返回值中的 instrumentCwd 前缀
    const normalizedCoverage: Record<string, any> = {};

    for (const [filePath, fileCoverage] of Object.entries(remappedCoverage)) {
      // 去掉 key 中的 instrumentCwd 前缀
      const normalizedPath = filePath.startsWith(instrumentCwdPrefix)
        ? filePath.slice(instrumentCwdPrefix.length)
        : filePath;

      normalizedCoverage[normalizedPath] = {
        ...(fileCoverage as Record<string, any>),
        path: normalizedPath,
      };
    }

    const finalCoverage = testExclude(
      normalizedCoverage,
      JSON.stringify({
        exclude: ['dist/**'],
      }),
    );
    return finalCoverage;
    // #endregion
  }
}

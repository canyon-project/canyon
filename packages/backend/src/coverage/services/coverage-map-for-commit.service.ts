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
   * 解析单个 label selector 字符串
   * @param selectorStr - 格式: key=value, key!=value, key=~"regex", key!~"regex"
   * @returns 解析后的对象 { key, operator, value } 或 null
   */
  private parseSelector(selectorStr: string): {
    key: string;
    operator: '=' | '!=' | '=~' | '!~';
    value: string;
  } | null {
    const trimmed = selectorStr.trim();
    if (!trimmed) return null;

    // 匹配 key=value, key!=value, key=~"regex", key!~"regex"
    const match = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*(=~|!~|!=|=)\s*(.+)$/);
    if (!match) return null;

    const [, key, operator, value] = match;
    // 移除引号（如果存在）
    const cleanValue = value.replace(/^["']|["']$/g, '');

    return {
      key,
      operator: operator as '=' | '!=' | '=~' | '!~',
      value: cleanValue,
    };
  }

  /**
   * 解析 scene selector 字符串，返回所有条件
   * @param scene - 字符串，格式为 "key=value,key2!=value2,key3=~\"regex\"" 或 JSON 字符串 "{ key1: 'value1', key2: 'value2' }"
   * @returns 条件数组
   */
  private parseSceneSelectors(scene?: string): Array<{
    key: string;
    operator: '=' | '!=' | '=~' | '!~';
    value: string;
  }> {
    if (!scene) {
      return [];
    }

    const trimmed = scene.trim();
    if (!trimmed) {
      return [];
    }

    // 尝试解析为 LogQL/PromQL 风格的 selector（例如: "key=value,key2!=value2,key3=~\"regex\""）
    if (trimmed.includes('=') || trimmed.includes('!=')) {
      const parts = trimmed.split(',').map((s) => s.trim()).filter(Boolean);
      return parts
        .map((part) => this.parseSelector(part))
        .filter((s): s is NonNullable<typeof s> => s !== null);
    }

    // 兼容旧的 JSON 格式（向后兼容）
    try {
      const sceneObj = JSON.parse(scene);

      // 如果解析后不是对象，返回空数组
      if (
        typeof sceneObj !== 'object' ||
        sceneObj === null ||
        Array.isArray(sceneObj)
      ) {
        return [];
      }

      // 获取所有 key-value 对，转换为 = 操作符
      return Object.entries(sceneObj).map(([key, value]) => ({
        key,
        operator: '=' as const,
        value: String(value),
      }));
    } catch {
      // JSON 解析失败，返回空数组
      return [];
    }
  }

  /**
   * 使用 JavaScript 过滤 coverage 记录，根据 scene 条件
   * @param records - coverage 记录数组
   * @param selectors - scene selector 条件数组
   * @returns 过滤后的记录数组
   */
  private filterBySceneSelectors<T extends { scene: any }>(
    records: T[],
    selectors: Array<{ key: string; operator: '=' | '!=' | '=~' | '!~'; value: string }>,
  ): T[] {
    if (selectors.length === 0) {
      return records;
    }

    return records.filter((record) => {
      const scene = record.scene;
      if (!scene || typeof scene !== 'object') {
        return false;
      }

      // 所有条件都必须满足（AND 关系）
      return selectors.every((selector) => {
        const { key, operator, value } = selector;
        const sceneValue = scene[key];

        // 如果 scene 中没有这个 key，不匹配
        if (sceneValue === undefined) {
          return false;
        }

        const sceneValueStr = String(sceneValue);

        switch (operator) {
          case '=':
            return sceneValueStr === value;
          case '!=':
            return sceneValueStr !== value;
          case '=~':
            // 正则匹配
            try {
              const regex = new RegExp(value);
              return regex.test(sceneValueStr);
            } catch {
              // 正则表达式无效，不匹配
              return false;
            }
          case '!~':
            // 正则不匹配
            try {
              const regex = new RegExp(value);
              return !regex.test(sceneValueStr);
            } catch {
              // 正则表达式无效，不匹配
              return false;
            }
          default:
            return false;
        }
      });
    });
  }

  async invoke({
    provider,
    repoID,
    sha,
    buildTarget,
    reportProvider,
    reportID,
    filePath,
    scene,
  }: CoverageQueryParamsTypes) {
    // #region Step 1: 查询覆盖率记录并获取基础信息
    // 先查询所有符合条件的记录（不包含 scene 条件）
    const coverageWhereCondition: any = {
      provider,
      repoID,
      sha,
      buildTarget,
    };

    const allCoverageRecords = await this.prisma.coverage.findMany({
      where: coverageWhereCondition,
    });

    // 解析 scene selector 条件
    const sceneSelectors = this.parseSceneSelectors(scene);

    // 使用 JavaScript 过滤 scene 条件
    const coverageRecords = this.filterBySceneSelectors(
      allCoverageRecords,
      sceneSelectors,
    );
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
        ? decodeCompressedObject(coverageMapRecord.restore)
        : decodeCompressedObject(coverageMapRecord.origin);

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

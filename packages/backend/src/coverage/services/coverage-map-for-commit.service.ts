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
  async invoke({
    provider,
    repoID,
    sha,
    buildTarget,
    reportProvider,
    reportID,
    filePath,
  }: CoverageQueryParamsTypes) {
    const coverageRecords = await this.prisma.coverage.findMany({
      where: {
        provider,
        repoID,
        sha,
        buildTarget,
      },
    });

    if (coverageRecords.length === 0) {
      return {};
    }

    const coverageRecord = coverageRecords[0];
    const { instrumentCwd, buildHash } = coverageRecord;
    const instrumentCwdPrefix = instrumentCwd + '/';

    const fullFilePath = instrumentCwdPrefix + filePath;
    const mapRelations = await this.prisma.coverageMapRelation.findMany({
      where: {
        buildHash,
        fullFilePath,
      },
    });

    if (mapRelations.length === 0) {
      return {};
    }

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

    // 使用 Map 存储文件覆盖率映射，后续查找更快
    const fileCoverageMap = new Map<string, any>();

    for (const relation of mapRelations) {
      const rawFilePath = relation.restoreFullFilePath || relation.fullFilePath;
      const sourceMapRecord = sourceMapIndex.get(relation.sourceMapHash);
      const coverageMapKey = `${relation.coverageMapHash}|${relation.fileContentHash}`;
      const coverageMapRecord = coverageMapIndex.get(coverageMapKey);

      if (!coverageMapRecord) continue;

      const decodedCoverageMap = coverageMapRecord.restore
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
      return {};
    }

    // 查询所有相同 buildHash 的覆盖率命中数据
    const coverageHits = await this.prisma.coverageHit.findMany({
      where: {
        buildHash,
      },
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
      return {};
    }

    const remappedCoverage = await remapCoverageByOld(mergedCoverageData);

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
  }
}

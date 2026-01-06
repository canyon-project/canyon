import { Injectable } from '@nestjs/common';
// @ts-expect-error - canyon-map 类型定义可能不完整
import { remapCoverage } from 'canyon-map';
import { decodeCompressedObject } from '../../collect/helpers/transform';
import {
  addMaps,
  ensureNumMap,
  NumMap,
} from '../../helpers/coverage-merge.util';
import { testExclude } from '../../helpers/test-exclude';
import { PrismaService } from '../../prisma/prisma.service';
// import { CoverageQueryParams } from '../../types';
import { extractIstanbulData } from '../helpers/coverage-map-util';
import { CoverageQueryParamsTypes } from '../types/coverage-query-params.types';
import { CoverageMapStoreService } from './coverage.map-store.service';
import {remapCoverageByOld} from "../../collect/helpers/canyon-data";

/*
此服务是基本覆盖率查询服务，保持手作
手作りにこだわる
*/

@Injectable()
export class CoverageMapForCommitService {
  constructor(
    private readonly coverageMapStoreService: CoverageMapStoreService,
    private readonly prisma: PrismaService,
  ) {}
  async invoke({
    provider,
    repoID,
    sha,
    buildTarget,
    reportProvider,
    reportID,
    filePath,
  }: CoverageQueryParamsTypes) {
    const coverageList = await this.prisma.coverage.findMany({
      where: {
        provider,
        repoID,
        sha,
        buildTarget,
      },
    });

    if (coverageList.length === 0) {
      return {};
    }

    const coverage = coverageList[0];
    const { instrumentCwd, buildHash } = coverage;

    // 有了init map方便很多，直接查关系表就行
    const coverageMapRelationList =
      await this.prisma.coverageMapRelation.findMany({
        where: {
          buildHash: buildHash,
          fullFilePath:
            instrumentCwd +
            '/' +
            filePath,
        },
      });
    // TODO 优化查询逻辑

    const coverageSourceMapList = await this.prisma.coverageSourceMap.findMany({
      where: {
        hash: {
          in: coverageMapRelationList.map((item) => item.sourceMapHash),
        },
      },
    });

    const coverageMapList = await this.prisma.coverageMap.findMany({
      where: {
        hash: {
          in: coverageMapRelationList.map(
            (item) => `${item.coverageMapHash}|${item.fileContentHash}`,
          ),
        },
      },
    });

    const box = {};

    for (const relation of coverageMapRelationList) {
      const rawFilePath = relation.restoreFullFilePath || relation.fullFilePath;
      const sourceMapItem = coverageSourceMapList.find(
        (item) => item.hash === relation.sourceMapHash,
      );
      const coverageMapItem = coverageMapList.find(
        (item) =>
          item.hash ===
          `${relation.coverageMapHash}|${relation.fileContentHash}`,
      );

      // const inputSourceMap = sourceMapItem ? decodeCompressedObject(sourceMapItem.sourceMap) : null;
      const coverageMap = coverageMapItem?.restore
        ? decodeCompressedObject(coverageMapItem?.restore)
        : decodeCompressedObject(coverageMapItem?.origin);
      box[rawFilePath] = {
        path: rawFilePath,
        ...coverageMap,
        inputSourceMap: sourceMapItem
          ? decodeCompressedObject(sourceMapItem.sourceMap)
          : undefined,
      };
    }


    // 查询所有相同 buildHash 的 coverageHit
    const coverageHitList = await this.prisma.coverageHit.findMany({
      where: {
        buildHash: buildHash,
      },
    });

    // 直接按 rawFilePath 聚合所有 hit 数据（不区分 sceneKey）
    const aggregatedHits = new Map<
      string,
      {
        s: NumMap;
        f: NumMap;
      }
    >();

    for (const hit of coverageHitList) {
      // 获取或创建 rawFilePath 的聚合数据
      if (!aggregatedHits.has(hit.rawFilePath)) {
        aggregatedHits.set(hit.rawFilePath, {
          s: {},
          f: {},
        });
      }

      const aggregated = aggregatedHits.get(hit.rawFilePath)!;
      // 合并 s, f 字段（跨所有 sceneKey 聚合）
      aggregated.s = addMaps(aggregated.s, ensureNumMap(hit.s));
      aggregated.f = addMaps(aggregated.f, ensureNumMap(hit.f));
    }

    // 将 hit 数据与 box 中的 map 重组
    // 只保留同时有 map 和 hit 的 rawFilePath
    const result: Record<string, any> = {};

    // 遍历 box 中的所有文件，只保留同时有 map 和 hit 的文件
    for (const [rawFilePath, coverageMapData] of Object.entries(box)) {
      // 获取该 rawFilePath 对应的聚合 hit 数据
      const hitData = aggregatedHits.get(rawFilePath);

      // 只保留同时有 map 和 hit 的文件
      if (hitData) {
        // 合并 map 结构和 hit 数据
        result[rawFilePath] = {
          ...(coverageMapData as Record<string, any>),
          s: hitData.s,
          f: hitData.f,
          b: {},
          branchMap:{}
          // path: rawFilePath,
        };
      }
    }
    // return result
    const remapped = await remapCoverageByOld(result);

    // 替换返回值中的 instrumentCwd 前缀
    const remappedWithoutInstrumentCwd: Record<string, any> = {};
    const instrumentCwdPrefix = instrumentCwd + '/';

    for (const [path, coverageData] of Object.entries(remapped)) {
      // 去掉 key 中的 instrumentCwd 前缀
      const newPath = path.startsWith(instrumentCwdPrefix)
        ? path.replace(instrumentCwdPrefix, '')
        : path;

      // 如果 coverageData 中有 path 字段，也替换掉
      const newCoverageData = {
        ...(coverageData as Record<string, any>),
        path: newPath,
      };

      remappedWithoutInstrumentCwd[newPath] = newCoverageData;
    }

    const filtered = testExclude(
      remappedWithoutInstrumentCwd,
      JSON.stringify({
        exclude: ['dist/**'],
      }),
    );
    return filtered;
  }
}

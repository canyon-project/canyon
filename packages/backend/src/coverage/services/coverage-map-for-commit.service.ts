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

    // 先按 sceneKey 分组，然后按 rawFilePath 聚合
    // 结构: Map<sceneKey, Map<rawFilePath, aggregatedHit>>
    const groupedBySceneKey = new Map<
      string,
      Map<
        string,
        {
          s: NumMap;
          f: NumMap;
        }
      >
    >();

    for (const hit of coverageHitList) {
      // 获取或创建 sceneKey 组
      if (!groupedBySceneKey.has(hit.sceneKey)) {
        groupedBySceneKey.set(hit.sceneKey, new Map());
      }
      const fileMap = groupedBySceneKey.get(hit.sceneKey)!;

      // 获取或创建 rawFilePath 的聚合数据
      if (!fileMap.has(hit.rawFilePath)) {
        fileMap.set(hit.rawFilePath, {
          s: {},
          f: {},
        });
      }

      const aggregated = fileMap.get(hit.rawFilePath)!;
      // 合并 s, f 字段
      aggregated.s = addMaps(aggregated.s, ensureNumMap(hit.s));
      aggregated.f = addMaps(aggregated.f, ensureNumMap(hit.f));
    }

    // 将 Map 结构转换为 JSON 对象
    const result: Record<
      string,
      Record<
        string,
        {
          s: NumMap;
          f: NumMap;
        }
      >
    > = {};
    for (const [sceneKey, fileMap] of groupedBySceneKey.entries()) {
      result[sceneKey] = {};
      for (const [rawFilePath, aggregated] of fileMap.entries()) {
        result[sceneKey][rawFilePath] = aggregated;
      }
    }

    return result;
  }
}

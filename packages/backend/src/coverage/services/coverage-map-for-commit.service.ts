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
        },
      });

    // TODO 优化查询逻辑

    const pathToHash = new Map<string, string>();
    const pathToRelation = new Map<
      string,
      (typeof coverageMapRelationList)[0]
    >();
    const sourceMapHashSet = new Set<string>();
    for (const r of coverageMapRelationList) {
      const key =
        r.sourceMapHash === '' ? r.fullFilePath : r.restoreFullFilePath;

      if (!pathToHash.has(key))
        pathToHash.set(key, `${r.coverageMapHash}|${r.fileContentHash}`);

      // 构建 path -> relation 的映射，用于后续获取 sourceMapHash
      // 同时使用 fullFilePath 和 key（可能是 restoreFullFilePath）作为映射
      pathToRelation.set(r.fullFilePath, r);
      if (key !== r.fullFilePath) {
        pathToRelation.set(key, r);
      }

      // 收集需要查询的 sourceMapHash（非空）
      if (r.sourceMapHash && r.sourceMapHash !== '') {
        sourceMapHashSet.add(r.sourceMapHash);
      }
    }

    const hashList = coverageMapRelationList.map(
      ({ coverageMapHash, fileContentHash }) =>
        `${coverageMapHash}|${fileContentHash}`,
    );
    const hashToMap =
      await this.coverageMapStoreService.fetchCoverageMapsFromClickHouse(
        hashList,
      );

    // 基于 coverageMapRelationList 中的 sourceMapHash 查询 sourceMap，并构建映射
    const sourceMapHashToSourceMap = new Map<string, any>();
    if (sourceMapHashSet.size > 0) {
      const coverageSourceMapList = await this.prisma.coverageSourceMap
        .findMany({
          where: {
            hash: {
              in: Array.from(sourceMapHashSet),
            },
          },
        })
        .then((r) =>
          r.map((i) => ({
            sourceMap: decodeCompressedObject(i.sourceMap),
            hash: i.hash,
          })),
        );

      // 构建 sourceMapHash -> sourceMap 的映射，方便后续直接使用
      for (const item of coverageSourceMapList) {
        sourceMapHashToSourceMap.set(item.hash, item.sourceMap);
      }
    }

    // 构建 sourceMapHash -> coverageMapRelation 的映射，用于后续 reMap
    const sourceMapHashToRelation = new Map<
      string,
      (typeof coverageMapRelationList)[0]
    >();
    for (const r of coverageMapRelationList) {
      if (r.sourceMapHash && r.sourceMapHash !== '') {
        sourceMapHashToRelation.set(r.sourceMapHash, r);
      }
    }

    // 查hit
    const rows = await this.prisma.coverageHit.findMany({
      where: {
        buildHash: buildHash,
      },
    });

    // 按 rawFilePath 分组并合并多个 coverageID 的数据
    const mergedRows = new Map<
      string,
      {
        rawFilePath: string;
        s: NumMap;
        f: NumMap;
        latestTs: Date;
      }
    >();

    for (const r of rows || []) {
      const rawFilePath = r.rawFilePath;
      const sMap = ensureNumMap(r.s);
      const fMap = ensureNumMap(r.f);
      const ts =
        r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt);

      const existing = mergedRows.get(rawFilePath);
      if (!existing) {
        mergedRows.set(rawFilePath, {
          rawFilePath,
          s: sMap,
          f: fMap,
          latestTs: ts,
        });
      } else {
        existing.s = addMaps(existing.s, sMap);
        existing.f = addMaps(existing.f, fMap);
        if (ts > existing.latestTs) {
          existing.latestTs = ts;
        }
      }
    }

    // 9) 组装最终结果：合并命中、补齐 0 值、转换分支为数组
    const result: Record<string, unknown> = {};
    for (const mergedRow of mergedRows.values()) {
      // 未处理的路径
      const path = mergedRow.rawFilePath;
      const structure = hashToMap.find((i) => {
        return i.hash === pathToHash.get(path);
      });

      if (structure) {
        const relation = pathToRelation.get(path);
        const sourceMapHash = relation?.sourceMapHash;
        const inputSourceMap =
          sourceMapHash && sourceMapHash !== ''
            ? sourceMapHashToSourceMap.get(sourceMapHash)
            : undefined;

        result[path] = {
          path,
          ...extractIstanbulData(structure),
          s: mergedRow.s,
          f: mergedRow.f,
          contentHash: structure.hash.split('|')[1],
          ...(inputSourceMap && { inputSourceMap }),
        };
      }
    }

    // 10) 使用 canyon-map 进行 remap（如果有 inputSourceMap）
    const remappedResult: Record<string, unknown> = {};
    const itemsToRemap: Record<string, unknown> = {};
    const itemsWithoutRemap: Record<string, unknown> = {};

    // 分离需要 remap 和不需要 remap 的项
    for (const [path, item] of Object.entries(result)) {
      if ((item as any).inputSourceMap) {
        itemsToRemap[path] = item;
      } else {
        itemsWithoutRemap[path] = item;
      }
    }

    // 对需要 remap 的项进行 remap
    if (Object.keys(itemsToRemap).length > 0) {
      try {
        const remapped = await remapCoverage(itemsToRemap);
        // remapCoverage 返回的是以新路径为 key 的对象
        Object.assign(remappedResult, remapped);
      } catch (error) {
        // 如果 remap 失败，保留原始数据
        console.error('Remap error:', error);
        Object.assign(remappedResult, itemsToRemap);
      }
    }

    // 合并不需要 remap 的项
    Object.assign(remappedResult, itemsWithoutRemap);

    // 11) 使用 instrumentCwd 替换路径，去掉 instrumentCwd 前缀
    const normalizedResult: Record<string, unknown> = {};
    for (const [path, item] of Object.entries(remappedResult)) {
      let normalizedPath = path;

      // 如果路径以 instrumentCwd 开头，则去掉该前缀
      if (instrumentCwd) {
        if (path.startsWith(instrumentCwd + '/')) {
          normalizedPath = path.replace(instrumentCwd + '/', '');
        } else if (path === instrumentCwd) {
          normalizedPath = '';
        } else if (path.startsWith(instrumentCwd)) {
          normalizedPath = path.replace(instrumentCwd, '');
        }
      }

      // 更新 item 中的 path 字段（如果存在）
      const updatedItem = { ...(item as any) };
      if (updatedItem.path) {
        updatedItem.path = normalizedPath;
      }

      normalizedResult[normalizedPath] = updatedItem;
    }

    // 12) 使用 testExclude 过滤掉 dist 开头的文件
    const filteredResult = testExclude(
      normalizedResult,
      JSON.stringify({
        exclude: ['dist/**'],
      }),
    );

    return filteredResult;
  }
}

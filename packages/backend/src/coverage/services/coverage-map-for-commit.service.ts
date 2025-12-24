import { Injectable } from '@nestjs/common';
import { remapCoverageByOld } from '../../collect/helpers/canyon-data';
import { generateObjectSignature } from '../../collect/helpers/generateObjectSignature';
import { decodeCompressedObject } from '../../collect/helpers/transform';
import {
  addMaps,
  ensureNumMap,
  NumMap,
} from '../../helpers/coverage-merge.util';
import { testExclude } from '../../helpers/test-exclude';
import { logger } from '../../logger';
import { PrismaService } from '../../prisma/prisma.service';

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
  }: {
    provider: string;
    repoID: string;
    sha: string;
    buildTarget?: string;
    reportProvider?: string;
    reportID?: string;
    filePath?: string;
  }) {
    // 第一步：生成coverageID，核心7个字段，确保顺序
    const coverageID = generateObjectSignature({
      provider,
      repoID,
      sha,
      buildTarget,
      reportProvider,
      reportID,
    });
    // 生成versionID
    const versionID = generateObjectSignature({
      provider,
      repoID,
      sha,
      buildTarget,
    });

    // 查询 coverHitAggNext 表获取 hit 数据
    const where: any = {
      versionID: versionID,
    };

    if (filePath) {
      where.filePath = filePath;
    }

    const rows = await this.prisma.coverHitAggNext.findMany({
      where,
    });

    // 按 fullFilePath（未 remap 前的完整路径）分组并合并多个 coverageID 的数据
    // 注意：coverHitAggNext 表中的 filePath 实际上是未 remap 前的完整路径（fullFilePath）
    const mergedRows = new Map<
      string,
      {
        fullFilePath: string; // 未 remap 前的完整路径
        s: NumMap;
        f: NumMap;
        b: Record<string, unknown>;
        inputSourceMap: number;
        latestTs: Date;
      }
    >();

    for (const r of rows || []) {
      // r.filePath 实际上是未 remap 前的完整路径（fullFilePath）
      const fullFilePath = r.filePath;
      const sMap = ensureNumMap(r.s);
      const fMap = ensureNumMap(r.f);
      const ts = r.ts instanceof Date ? r.ts : new Date(r.ts);
      const inputSourceMap = r.inputSourceMap || 0;

      const existing = mergedRows.get(fullFilePath);
      if (!existing) {
        mergedRows.set(fullFilePath, {
          fullFilePath,
          s: sMap,
          f: fMap,
          b: (r.b as Record<string, unknown>) || {},
          inputSourceMap,
          latestTs: ts,
        });
      } else {
        existing.s = addMaps(existing.s, sMap);
        existing.f = addMaps(existing.f, fMap);
        if (ts > existing.latestTs) {
          existing.latestTs = ts;
        }
        // 如果任一记录需要 remap，则标记为需要 remap
        if (inputSourceMap === 1) {
          existing.inputSourceMap = 1;
        }
      }
    }

    // 获取 instrumentCwd
    const coverage = await this.prisma.coverage.findFirst({
      where: {
        versionID: versionID,
      },
    });
    const instrumentCwd = coverage?.instrumentCwd || '';

    // 查询 coverageMapRelation 获取 path 到 hash 的映射
    // 注意：需要查询所有相关的 relation，因为我们需要通过 restoreFullFilePath 来匹配
    const relationWhere: any = {
      versionID: versionID,
    };

    const relationsAll = await this.prisma.coverageMapRelation.findMany({
      where: relationWhere,
    });

    // 建立 restoreFullFilePath（未 remap 前的完整路径）到 relation 的映射
    const restoreFullFilePathToRelation = new Map<
      string,
      (typeof relationsAll)[0]
    >();
    for (const r of relationsAll) {
      if (!restoreFullFilePathToRelation.has(r.restoreFullFilePath)) {
        restoreFullFilePathToRelation.set(r.restoreFullFilePath, r);
      }
    }

    // 建立 filePath（remap 后的相对路径）到 hash 的映射
    const pathToHash = new Map<string, string>();
    for (const r of relationsAll) {
      if (!pathToHash.has(r.filePath)) {
        pathToHash.set(r.filePath, `${r.coverageMapHashID}|${r.contentHashID}`);
      }
    }

    // 获取所有需要的 hash
    const hashList = Array.from(
      new Set(
        relationsAll.map((x) => `${x.coverageMapHashID}|${x.contentHashID}`),
      ),
    );

    // 从 coverMap 表查询 map 数据
    const coverMaps = await this.prisma.coverMap.findMany({
      where: {
        hash: {
          in: hashList,
        },
      },
    });

    const hashToMap = new Map<string, (typeof coverMaps)[0]>();
    for (const map of coverMaps) {
      hashToMap.set(map.hash, map);
    }

    // 对于需要 remap 的数据进行 remap
    const remappedRows = new Map<
      string,
      {
        filePath: string; // remap 后的相对路径
        s: NumMap;
        f: NumMap;
        b: Record<string, unknown>;
        inputSourceMap: number;
        latestTs: Date;
      }
    >();
    // 保存 remap 后的 filePath 到 coverMap 的映射
    const remappedPathToCoverMap = new Map<string, (typeof coverMaps)[0]>();

    for (const [fullFilePath, mergedRow] of mergedRows.entries()) {
      if (mergedRow.inputSourceMap === 1) {
        // 需要 remap
        // 使用 restoreFullFilePath（未 remap 前的完整路径）来查找 relation
        const coverageMapRelation =
          restoreFullFilePathToRelation.get(fullFilePath);
        if (
          coverageMapRelation &&
          coverageMapRelation.coverageMapHashID &&
          coverageMapRelation.sourceMapHashID &&
          coverageMapRelation.sourceMapHashID !== ''
        ) {
          const coverMap = await this.prisma.coverMap.findFirst({
            where: {
              hash: {
                startsWith: coverageMapRelation.coverageMapHashID,
              },
            },
          });

          const coverageSourceMap = await this.prisma.coverageSourceMap
            .findFirst({
              where: {
                hash: coverageMapRelation.sourceMapHashID,
              },
            })
            .then((r) => decodeCompressedObject(r?.sourceMap));

          if (coverMap && coverageSourceMap) {
            try {
              const remapped = await remapCoverageByOld({
                [coverageMapRelation.restoreFullFilePath]: {
                  path: coverageMapRelation.restoreFullFilePath,
                  // @ts-expect-error
                  ...coverMap.restore,
                  branchMap: {},
                  inputSourceMap: coverageSourceMap,
                  b: mergedRow.b,
                  f: mergedRow.f,
                  s: mergedRow.s,
                },
              });

              const remappedResult = Object.values(remapped)[0] as any;
              if (remappedResult && remappedResult.path) {
                const remappedFilePath = remappedResult.path.replace(
                  instrumentCwd + '/',
                  '',
                );
                remappedRows.set(remappedFilePath, {
                  filePath: remappedFilePath,
                  s: ensureNumMap(remappedResult.s),
                  f: ensureNumMap(remappedResult.f),
                  b: remappedResult.b || {},
                  inputSourceMap: 1,
                  latestTs: mergedRow.latestTs,
                });
                // 保存 remap 后的 filePath 到 coverMap 的映射
                // remap 后的数据使用 coverMap.origin（remap 后的 map）
                remappedPathToCoverMap.set(remappedFilePath, coverMap);
                continue;
              }
            } catch (error) {
              logger({
                type: 'warn',
                title: 'CoverageMapForCommit',
                message: 'Failed to remap coverage',
                addInfo: {
                  filePath,
                  error: error instanceof Error ? error.message : String(error),
                },
              });
            }
          }
        }
      }

      // 不需要 remap 或 remap 失败，使用原始数据
      // 需要将 fullFilePath 转换为相对路径（filePath）
      // 查找对应的 relation 来获取 remap 后的 filePath
      const relation = restoreFullFilePathToRelation.get(fullFilePath);
      if (relation) {
        // 使用 relation 中的 filePath（remap 后的相对路径）
        remappedRows.set(relation.filePath, {
          filePath: relation.filePath,
          s: mergedRow.s,
          f: mergedRow.f,
          b: mergedRow.b,
          inputSourceMap: mergedRow.inputSourceMap,
          latestTs: mergedRow.latestTs,
        });
      } else {
        // 如果没有找到 relation，尝试从 fullFilePath 中提取相对路径
        // 去掉 instrumentCwd 前缀
        const relativePath = fullFilePath.startsWith(instrumentCwd + '/')
          ? fullFilePath.replace(instrumentCwd + '/', '')
          : fullFilePath;
        remappedRows.set(relativePath, {
          filePath: relativePath,
          s: mergedRow.s,
          f: mergedRow.f,
          b: mergedRow.b,
          inputSourceMap: mergedRow.inputSourceMap,
          latestTs: mergedRow.latestTs,
        });
      }
    }

    // 组装最终结果
    const result: Record<string, unknown> = {};
    for (const mergedRow of remappedRows.values()) {
      const path = mergedRow.filePath;

      // 优先检查是否是 remap 后的路径
      const remappedCoverMap = remappedPathToCoverMap.get(path);
      if (remappedCoverMap) {
        // remap 后的数据使用 coverMap.origin（remap 后的 map）
        result[path] = {
          path,
          // @ts-expect-error
          statementMap: remappedCoverMap.origin?.statementMap || {},
          // @ts-expect-error
          fnMap: remappedCoverMap.origin?.fnMap || {},
          // @ts-expect-error
          branchMap: remappedCoverMap.origin?.branchMap || {},
          s: mergedRow.s,
          f: mergedRow.f,
          b: mergedRow.b,
          contentHash: remappedCoverMap.hash.split('|')[1] || '',
        };
        continue;
      }

      // 非 remap 的数据，使用原始逻辑
      const hash = pathToHash.get(path);
      if (hash) {
        const coverMap = hashToMap.get(hash);
        if (coverMap) {
          result[path] = {
            path,
            // @ts-expect-error
            statementMap: coverMap.origin?.statementMap || {},
            // @ts-expect-error
            fnMap: coverMap.origin?.fnMap || {},
            // @ts-expect-error
            branchMap: coverMap.origin?.branchMap || {},
            s: mergedRow.s,
            f: mergedRow.f,
            b: mergedRow.b,
            contentHash: hash.split('|')[1] || '',
          };
        } else {
          // 如果没有找到 map，仍然返回 hit 数据
          result[path] = {
            path,
            statementMap: {},
            fnMap: {},
            branchMap: {},
            s: mergedRow.s,
            f: mergedRow.f,
            b: mergedRow.b,
            contentHash: '',
          };
        }
      } else {
        // 如果没有找到 relation，仍然返回 hit 数据
        result[path] = {
          path,
          statementMap: {},
          fnMap: {},
          branchMap: {},
          s: mergedRow.s,
          f: mergedRow.f,
          b: mergedRow.b,
          contentHash: '',
        };
      }
    }

    // include/exclude 过滤
    const repo = await this.prisma.repo.findFirst({
      where: {
        id: repoID,
      },
    });
    const filtered = testExclude(
      result,
      JSON.stringify({
        exclude: ['dist/**'],
      }),
    );
    return filtered;
  }
}

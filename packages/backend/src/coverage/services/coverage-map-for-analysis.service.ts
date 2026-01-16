import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CoverageAnalysisQueryParamsTypes,
} from '../types/coverage-query-params.types';
import {ConfigService} from "@nestjs/config";
import axios from 'axios';
import { decodeCompressedObject } from '../../collect/helpers/transform';

@Injectable()
export class CoverageMapForAnalysisService {
  constructor(private readonly prisma: PrismaService,    private readonly configService: ConfigService,) {}

  async invoke({
    provider,
    repoID,
    analysisID,
    buildTarget,
    filePath,
    scene,
  }: CoverageAnalysisQueryParamsTypes) {
    // 变量定义
    const base = await this.configService.get('INFRA.GITLAB_BASE_URL');
    const token = await this.configService.get('INFRA.GITLAB_PRIVATE_TOKEN');
    const [afterSha, nowSha] = analysisID.split('...');
    // 关键点，对于Analysis来说，必须要通过diff过滤，不然分析数据量太大
    const diffList = await this.prisma.diff.findMany({
      where:{
        from: afterSha,
        to: nowSha,
        provider,
        repo_id: repoID,
      }
    })

    // 构建GitLab Compare API URL
    const url = `${base}/api/v4/projects/${repoID}/repository/compare?from=${afterSha}&to=${nowSha}`;
    const resp = await axios.get(url, {
      headers: {
        'PRIVATE-TOKEN': token,
      },
    }).then(({data})=>data);

    const allCommits = resp.commits.map((commit)=>commit.id).concat([afterSha, nowSha]);

    // 去重复
    const filteredCommits = [
      ...new Set(allCommits)
    ]

    // 准备基准map - 以 nowSha 为基准
    const nowShaIndex = filteredCommits.indexOf(nowSha);
    if (nowShaIndex === -1) {
      return {
        success: false,
        message: 'nowSha not found in filtered commits',
      };
    }

    // 获取 nowSha 的 coverage map
    const nowShaCoverageRecords = await this.prisma.coverage.findMany({
      where: {
        provider,
        repoID,
        sha: nowSha,
        buildTarget,
      },
    });

    if (nowShaCoverageRecords.length === 0) {
      return {
        success: false,
        message: 'No coverage records found for nowSha',
      };
    }

    const nowShaCoverageRecord = nowShaCoverageRecords[0];
    const { instrumentCwd: nowShaInstrumentCwd, buildHash: nowShaBuildHash } = nowShaCoverageRecord;
    const nowShaInstrumentCwdPrefix = nowShaInstrumentCwd + '/';

    // 查询 nowSha 的 mapRelations（只查询 diffList 中的文件）
    const nowShaMapRelations = await this.prisma.coverageMapRelation.findMany({
      where: {
        buildHash: nowShaBuildHash,
        fullFilePath: {
          in: diffList.map(d => nowShaInstrumentCwdPrefix + d.path),
        },
      },
    });

    // 构建 nowSha 的 coverage map 索引
    const nowShaCoverageMapHashKeySet = new Set<string>();
    const nowShaSourceMapHashSet = new Set<string>();
    for (const relation of nowShaMapRelations) {
      nowShaCoverageMapHashKeySet.add(
        `${relation.coverageMapHash}|${relation.fileContentHash}`,
      );
      if (relation.sourceMapHash) {
        nowShaSourceMapHashSet.add(relation.sourceMapHash);
      }
    }

    // 查询 nowSha 的 coverage maps 和 source maps
    const [nowShaCoverageMaps, nowShaSourceMaps] = await Promise.all([
      this.prisma.coverageMap.findMany({
        where: {
          hash: { in: Array.from(nowShaCoverageMapHashKeySet) },
        },
      }),
      this.prisma.coverageSourceMap.findMany({
        where: {
          hash: { in: Array.from(nowShaSourceMapHashSet) },
        },
      }),
    ]);

    // 构建索引
    const nowShaCoverageMapIndex = new Map<string, (typeof nowShaCoverageMaps)[0]>();
    for (const coverageMap of nowShaCoverageMaps) {
      nowShaCoverageMapIndex.set(coverageMap.hash, coverageMap);
    }

    const nowShaSourceMapIndex = new Map<string, (typeof nowShaSourceMaps)[0]>();
    for (const sourceMap of nowShaSourceMaps) {
      nowShaSourceMapIndex.set(sourceMap.hash, sourceMap);
    }

    // 构建 nowSha 的 fileCoverageMap
    const nowShaFileCoverageMap = new Map<string, any>();
    for (const relation of nowShaMapRelations) {
      const rawFilePath = relation.restoreFullFilePath || relation.fullFilePath;
      const sourceMapRecord = nowShaSourceMapIndex.get(relation.sourceMapHash);
      const coverageMapKey = `${relation.coverageMapHash}|${relation.fileContentHash}`;
      const coverageMapRecord = nowShaCoverageMapIndex.get(coverageMapKey);
      if (!coverageMapRecord) continue;

      const decodedCoverageMap = decodeCompressedObject(coverageMapRecord.map)

      nowShaFileCoverageMap.set(rawFilePath, {
        path: rawFilePath,
        fileContentHash: relation.fileContentHash,
        ...decodedCoverageMap,
      });
    }

    // 遍历其他 commit，与 nowSha 进行比较
    const comparisonResults: any[] = [];

    for (let i = 0; i < filteredCommits.length; i++) {
      const sha = filteredCommits[i] as string;

      // 跳过 nowSha 自己
      if (sha === nowSha) {
        continue;
      }

      const coverageRecords = await this.prisma.coverage.findMany({
        where: {
          provider,
          repoID,
          sha: sha as string,
          buildTarget,
        },
      });

      if (coverageRecords.length === 0) {
        continue;
      }

      const coverageRecord = coverageRecords[0];
      const { instrumentCwd, buildHash } = coverageRecord;
      const instrumentCwdPrefix = instrumentCwd + '/';

      // 查询该 commit 的 mapRelations（只查询 diffList 中的文件）
      const mapRelations = await this.prisma.coverageMapRelation.findMany({
        where: {
          buildHash,
          fullFilePath: {
            in: diffList.map(d => instrumentCwdPrefix + d.path),
          },
        },
      });

      // 构建该 commit 的 coverage map 索引
      const coverageMapHashKeySet = new Set<string>();
      const sourceMapHashSet = new Set<string>();
      for (const relation of mapRelations) {
        coverageMapHashKeySet.add(
          `${relation.coverageMapHash}|${relation.fileContentHash}`,
        );
        if (relation.sourceMapHash) {
          sourceMapHashSet.add(relation.sourceMapHash);
        }
      }

      // 查询该 commit 的 coverage maps 和 source maps
      const [coverageMaps, sourceMaps] = await Promise.all([
        this.prisma.coverageMap.findMany({
          where: {
            hash: { in: Array.from(coverageMapHashKeySet) },
          },
        }),
        this.prisma.coverageSourceMap.findMany({
          where: {
            hash: { in: Array.from(sourceMapHashSet) },
          },
        }),
      ]);

      // 构建索引
      const coverageMapIndex = new Map<string, (typeof coverageMaps)[0]>();
      for (const coverageMap of coverageMaps) {
        coverageMapIndex.set(coverageMap.hash, coverageMap);
      }

      const sourceMapIndex = new Map<string, (typeof sourceMaps)[0]>();
      for (const sourceMap of sourceMaps) {
        sourceMapIndex.set(sourceMap.hash, sourceMap);
      }

      // 构建该 commit 的 fileCoverageMap
      const fileCoverageMap = new Map<string, any>();
      for (const relation of mapRelations) {
        const rawFilePath = relation.restoreFullFilePath || relation.fullFilePath;
        const sourceMapRecord = sourceMapIndex.get(relation.sourceMapHash);
        const coverageMapKey = `${relation.coverageMapHash}|${relation.fileContentHash}`;
        const coverageMapRecord = coverageMapIndex.get(coverageMapKey);
        if (!coverageMapRecord) continue;

        const decodedCoverageMap = decodeCompressedObject(coverageMapRecord.map)
        fileCoverageMap.set(rawFilePath, {
          path: rawFilePath,
          fileContentHash: relation.fileContentHash,
          ...decodedCoverageMap,
        });
      }

      // 与 nowSha 进行比较
      const fileComparisons: any[] = [];

      // 遍历 nowSha 的文件
      for (const [filePath, nowShaFileCoverage] of nowShaFileCoverageMap.entries()) {
        const otherFileCoverage = fileCoverageMap.get(filePath);

        if (!otherFileCoverage) {
          // 该 commit 中没有这个文件
          fileComparisons.push({
            filePath,
            status: 'missing',
            nowShaFileContentHash: nowShaFileCoverage.fileContentHash,
          });
          continue;
        }

        // 比较 fileContentHash
        const fileContentHashEqual = nowShaFileCoverage.fileContentHash === otherFileCoverage.fileContentHash;

        // 如果文件 contentHash 相同，直接可以合并
        if (fileContentHashEqual) {
          fileComparisons.push({
            filePath,
            status: 'fileContentHashEqual',
            fileContentHash: nowShaFileCoverage.fileContentHash,
            canMerge: true,
          });
          continue;
        }

        // 文件 contentHash 不同，需要深入到语句层，以 contentHash 为 key 进行比较
        const nowShaStatementMap = nowShaFileCoverage.statementMap || {};
        const otherStatementMap = otherFileCoverage.statementMap || {};

        // 构建 contentHash -> statementId[] 的映射
        // nowSha 的映射：contentHash -> statementId[]
        const nowShaHashToStatementIds = new Map<string, string[]>();
        for (const [statementId, statement] of Object.entries(nowShaStatementMap)) {
          const stmt = statement as any;
          if (stmt && stmt.contentHash) {
            if (!nowShaHashToStatementIds.has(stmt.contentHash)) {
              nowShaHashToStatementIds.set(stmt.contentHash, []);
            }
            nowShaHashToStatementIds.get(stmt.contentHash)!.push(statementId);
          }
        }

        // other 的映射：contentHash -> statementId[]
        const otherHashToStatementIds = new Map<string, string[]>();
        for (const [statementId, statement] of Object.entries(otherStatementMap)) {
          const stmt = statement as any;
          if (stmt && stmt.contentHash) {
            if (!otherHashToStatementIds.has(stmt.contentHash)) {
              otherHashToStatementIds.set(stmt.contentHash, []);
            }
            otherHashToStatementIds.get(stmt.contentHash)!.push(statementId);
          }
        }

        // 找出所有唯一的 contentHash
        const allContentHashes = new Set([
          ...nowShaHashToStatementIds.keys(),
          ...otherHashToStatementIds.keys(),
        ]);

        // 分析可以合并和不能合并的语句
        const mergeableStatements: Array<{
          contentHash: string;
          nowShaStatementId: string;
          otherStatementId: string;
        }> = [];

        const nonMergeableStatements: Array<{
          contentHash: string;
          reason: 'nowShaMultiple' | 'otherMultiple' | 'nowShaMissing' | 'otherMissing';
          nowShaStatementIds?: string[];
          otherStatementIds?: string[];
        }> = [];

        for (const contentHash of allContentHashes) {
          const nowShaStmtIds = nowShaHashToStatementIds.get(contentHash) || [];
          const otherStmtIds = otherHashToStatementIds.get(contentHash) || [];

          // 如果 nowSha 中没有这个 contentHash
          if (nowShaStmtIds.length === 0) {
            nonMergeableStatements.push({
              contentHash,
              reason: 'nowShaMissing',
              otherStatementIds: otherStmtIds,
            });
            continue;
          }

          // 如果 other 中没有这个 contentHash
          if (otherStmtIds.length === 0) {
            nonMergeableStatements.push({
              contentHash,
              reason: 'otherMissing',
              nowShaStatementIds: nowShaStmtIds,
            });
            continue;
          }

          // 如果 nowSha 中同一个 contentHash 对应多个 statementId，不能合并
          if (nowShaStmtIds.length > 1) {
            nonMergeableStatements.push({
              contentHash,
              reason: 'nowShaMultiple',
              nowShaStatementIds: nowShaStmtIds,
              otherStatementIds: otherStmtIds,
            });
            continue;
          }

          // 如果 other 中同一个 contentHash 对应多个 statementId，不能合并
          if (otherStmtIds.length > 1) {
            nonMergeableStatements.push({
              contentHash,
              reason: 'otherMultiple',
              nowShaStatementIds: nowShaStmtIds,
              otherStatementIds: otherStmtIds,
            });
            continue;
          }

          // 两个版本中都只有一个 statementId，可以合并
          mergeableStatements.push({
            contentHash,
            nowShaStatementId: nowShaStmtIds[0],
            otherStatementId: otherStmtIds[0],
          });
        }

        // 判断是否可以合并（至少有一个可以合并的语句）
        const canMerge = mergeableStatements.length > 0;

        fileComparisons.push({
          filePath,
          status: 'fileContentHashDifferent',
          nowShaFileContentHash: nowShaFileCoverage.fileContentHash,
          otherFileContentHash: otherFileCoverage.fileContentHash,
          mergeableStatementsCount: mergeableStatements.length,
          nonMergeableStatementsCount: nonMergeableStatements.length,
          totalContentHashes: allContentHashes.size,
          mergeableStatements: mergeableStatements.length > 0 ? mergeableStatements : undefined,
          nonMergeableStatements: nonMergeableStatements.length > 0 ? nonMergeableStatements : undefined,
          canMerge,
        });

      }

      comparisonResults.push({
        commitSha: sha,
        fileComparisons,
      });
    }

    return {
      success: true,
      baseCommit: nowSha,
      comparisonResults,
    };
  }
}

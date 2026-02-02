import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { remapCoverageByOld } from '../../collect/helpers/canyon-data';
import { decodeCompressedObject } from '../../collect/helpers/transform';
import {
  addMaps,
  ensureNumMap,
  NumMap,
} from '../../helpers/coverage-merge.util';
import { testExclude } from '../../helpers/test-exclude';
import { PrismaService } from '../../prisma/prisma.service';
import { CoverageAccumulativeQueryParamsTypes } from '../types/coverage-query-params.types';

@Injectable()
export class CoverageMapForAccumulativeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private async getGitLabCfg() {
    const base = await this.configService.get('INFRA.GITLAB_BASE_URL');
    const token = await this.configService.get('INFRA.GITLAB_PRIVATE_TOKEN');
    if (!base || !token) throw new BadRequestException('GitLab 配置缺失');
    return { base, token };
  }

  private async getGithubCfg() {
    const base = 'https://api.github.com';
    const token = await this.configService.get('INFRA.GITHUB_PRIVATE_TOKEN');
    if (!token) throw new BadRequestException('GitHub 配置缺失');
    return { base, token };
  }

  private async resolveGithubOwnerRepoByID(
    idOrSlug: string,
    base: string,
    token: string,
  ) {
    // 如果是 owner/repo 直接返回
    if (idOrSlug.includes('/')) {
      const [owner, repo] = idOrSlug.split('/');
      if (!owner || !repo) {
        throw new BadRequestException(
          'GitHub repoID 需为 owner/repo 或数字 ID',
        );
      }
      return { owner, repo };
    }
    // 如果是纯数字，则通过 /repositories/{id} 解析
    if (/^[0-9]+$/.test(idOrSlug)) {
      const url = `${base}/repositories/${encodeURIComponent(idOrSlug)}`;
      const resp = await axios.get(url, {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
      if (resp.status < 200 || resp.status >= 300) {
        throw new BadRequestException('无法解析 GitHub 仓库 ID');
      }
      const data = resp.data as {
        full_name?: string;
        owner?: { login?: string };
        name?: string;
      };
      const fullName = data.full_name;
      if (fullName && fullName.includes('/')) {
        const [owner, repo] = fullName.split('/');
        return { owner, repo };
      }
      const owner = data.owner?.login;
      const repo = data.name;
      if (!owner || !repo) {
        throw new BadRequestException('GitHub 仓库信息不完整');
      }
      return { owner, repo };
    }
    throw new BadRequestException('GitHub repoID 需为 owner/repo 或数字 ID');
  }

  private async getCommitsBetween({
    repoID,
    fromSha,
    toSha,
    provider,
  }: {
    repoID: string;
    fromSha: string;
    toSha: string;
    provider: string;
  }): Promise<string[]> {
    if (provider === 'github' || provider.startsWith('github')) {
      const { base, token } = await this.getGithubCfg();
      const { owner, repo } = await this.resolveGithubOwnerRepoByID(
        repoID,
        base,
        token,
      );

      // GitHub compare API: /repos/{owner}/{repo}/compare/{base}...{head}
      const url = `${base}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/compare/${encodeURIComponent(fromSha)}...${encodeURIComponent(toSha)}`;
      const resp = await axios.get(url, {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (resp.status < 200 || resp.status >= 300) {
        throw new BadRequestException('无法获取 GitHub commit 列表');
      }

      // GitHub 返回的 commits 数组，按时间顺序从旧到新
      const commits = resp.data.commits || [];
      const commitShas = commits
        .map((c: { sha?: string }) => c.sha)
        .filter(Boolean);

      // 确保 fromSha 在列表中，如果不在则添加到开头
      if (!commitShas.includes(fromSha)) {
        commitShas.unshift(fromSha);
      }
      // 确保 toSha 在列表中，如果不在则添加
      if (!commitShas.includes(toSha)) {
        commitShas.push(toSha);
      }

      return commitShas;
    } else {
      // GitLab
      const { base, token } = await this.getGitLabCfg();
      const pid = encodeURIComponent(repoID);
      // GitLab compare API: /projects/{id}/repository/compare?from={from}&to={to}
      const url = `${base}/api/v4/projects/${pid}/repository/compare?from=${encodeURIComponent(fromSha)}&to=${encodeURIComponent(toSha)}`;
      const resp = await axios.get(url, {
        headers: {
          'PRIVATE-TOKEN': token,
        },
      });

      if (resp.status < 200 || resp.status >= 300) {
        throw new BadRequestException('无法获取 GitLab commit 列表');
      }

      // GitLab 返回的 commits 数组，按时间顺序从旧到新
      const commits = resp.data.commits || [];
      const commitShas = commits
        .map((c: { id?: string }) => c.id)
        .filter(Boolean);

      // 确保 fromSha 在列表中，如果不在则添加到开头
      if (!commitShas.includes(fromSha)) {
        commitShas.unshift(fromSha);
      }
      // 确保 toSha 在列表中，如果不在则添加
      if (!commitShas.includes(toSha)) {
        commitShas.push(toSha);
      }

      return commitShas;
    }
  }

  async invoke({
    provider,
    repoID,
    accumulativeID,
    buildTarget,
    filePath,
    scene,
  }: CoverageAccumulativeQueryParamsTypes) {
    const [afterSha, nowSha] = accumulativeID.split('...');
    // 关键点，对于 accumulative 来说，必须要通过diff过滤，不然分析数据量太大
    const diffListWhereCondition: any = {
      from: afterSha,
      to: nowSha,
      provider,
      repo_id: repoID,
    };

    // 如果 filePath 存在，则只查询该文件的 diff
    if (filePath) {
      diffListWhereCondition.path = filePath;
    }

    const diffList = await this.prisma.diff.findMany({
      where: diffListWhereCondition,
      select: {
        path: true,
        additions: true,
        deletions: true,
      },
    });

    // 根据 provider 获取 commits 列表
    const filteredCommits = await this.getCommitsBetween({
      repoID,
      fromSha: afterSha,
      toSha: nowSha,
      provider,
    });

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
    const { instrumentCwd: nowShaInstrumentCwd, buildHash: nowShaBuildHash } =
      nowShaCoverageRecord;
    const nowShaInstrumentCwdPrefix = nowShaInstrumentCwd + '/';

    // 查询 nowSha 的 mapRelations（只查询 diffList 中的文件）
    const nowShaMapRelations = await this.prisma.coverageMapRelation.findMany({
      where: {
        buildHash: nowShaBuildHash,
        fullFilePath: {
          in: diffList.map((d) => nowShaInstrumentCwdPrefix + d.path),
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
    const nowShaCoverageMapIndex = new Map<
      string,
      (typeof nowShaCoverageMaps)[0]
    >();
    for (const coverageMap of nowShaCoverageMaps) {
      nowShaCoverageMapIndex.set(coverageMap.hash, coverageMap);
    }

    const nowShaSourceMapIndex = new Map<
      string,
      (typeof nowShaSourceMaps)[0]
    >();
    for (const sourceMap of nowShaSourceMaps) {
      nowShaSourceMapIndex.set(sourceMap.hash, sourceMap);
    }

    // 构建 nowSha 的 fileCoverageMap
    // 使用去掉插桩路径前缀的相对路径作为 key，以便后续比较
    const nowShaFileCoverageMap = new Map<string, any>();
    for (const relation of nowShaMapRelations) {
      const rawFilePath = relation.restoreFullFilePath || relation.fullFilePath;
      // 去掉插桩路径前缀，得到相对路径作为 key
      const normalizedPath = rawFilePath.startsWith(nowShaInstrumentCwdPrefix)
        ? rawFilePath.slice(nowShaInstrumentCwdPrefix.length)
        : rawFilePath;

      const sourceMapRecord = nowShaSourceMapIndex.get(relation.sourceMapHash);
      const coverageMapKey = `${relation.coverageMapHash}|${relation.fileContentHash}`;
      const coverageMapRecord = nowShaCoverageMapIndex.get(coverageMapKey);
      if (!coverageMapRecord) continue;

      const decodedCoverageMap = decodeCompressedObject(coverageMapRecord.map);

      nowShaFileCoverageMap.set(normalizedPath, {
        path: rawFilePath, // 保留完整路径在 path 字段中
        fileContentHash: relation.fileContentHash,
        ...decodedCoverageMap,
        inputSourceMap: sourceMapRecord
          ? decodeCompressedObject(sourceMapRecord.sourceMap)
          : undefined,
      });
    }

    // 查询 nowSha 的 hit 数据
    const nowShaCoverageHits = await this.prisma.coverageHit.findMany({
      where: {
        buildHash: nowShaBuildHash,
      },
    });

    // 聚合 nowSha 的 hit 数据（按 normalizedPath，去掉插桩路径前缀）
    const nowShaHitDataByFile = new Map<
      string,
      {
        s: NumMap;
        f: NumMap;
      }
    >();

    for (const coverageHit of nowShaCoverageHits) {
      // 去掉插桩路径前缀，得到相对路径作为 key
      const normalizedPath = coverageHit.rawFilePath.startsWith(
        nowShaInstrumentCwdPrefix,
      )
        ? coverageHit.rawFilePath.slice(nowShaInstrumentCwdPrefix.length)
        : coverageHit.rawFilePath;

      if (!nowShaHitDataByFile.has(normalizedPath)) {
        nowShaHitDataByFile.set(normalizedPath, {
          s: {},
          f: {},
        });
      }
      const fileHitData = nowShaHitDataByFile.get(normalizedPath)!;
      fileHitData.s = addMaps(fileHitData.s, ensureNumMap(coverageHit.s));
      fileHitData.f = addMaps(fileHitData.f, ensureNumMap(coverageHit.f));
    }

    // 遍历其他 commit，与 nowSha 进行比较并收集 hit 数据
    const comparisonResults: any[] = [];
    // 存储每个 commit 的 hit 数据和 fileCoverageMap，用于后续合并
    type CommitData = {
      hitDataByFile: Map<string, { s: NumMap; f: NumMap }>;
      fileCoverageMap: Map<string, any>;
    };
    const commitDataMap = new Map<string, CommitData>();

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
            in: diffList.map((d) => instrumentCwdPrefix + d.path),
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
      // 使用去掉插桩路径前缀的相对路径作为 key，以便后续比较
      const fileCoverageMap = new Map<string, any>();
      for (const relation of mapRelations) {
        const rawFilePath =
          relation.restoreFullFilePath || relation.fullFilePath;
        // 去掉插桩路径前缀，得到相对路径作为 key
        const normalizedPath = rawFilePath.startsWith(instrumentCwdPrefix)
          ? rawFilePath.slice(instrumentCwdPrefix.length)
          : rawFilePath;

        const sourceMapRecord = sourceMapIndex.get(relation.sourceMapHash);
        const coverageMapKey = `${relation.coverageMapHash}|${relation.fileContentHash}`;
        const coverageMapRecord = coverageMapIndex.get(coverageMapKey);
        if (!coverageMapRecord) continue;

        const decodedCoverageMap = decodeCompressedObject(
          coverageMapRecord.map,
        );
        fileCoverageMap.set(normalizedPath, {
          path: rawFilePath, // 保留完整路径在 path 字段中
          fileContentHash: relation.fileContentHash,
          ...decodedCoverageMap,
          inputSourceMap: sourceMapRecord
            ? decodeCompressedObject(sourceMapRecord.sourceMap)
            : undefined,
        });
      }

      // 查询该 commit 的 hit 数据
      const coverageHits = await this.prisma.coverageHit.findMany({
        where: {
          buildHash,
        },
      });

      // 聚合该 commit 的 hit 数据（按 normalizedPath，去掉插桩路径前缀）
      const hitDataByFile = new Map<
        string,
        {
          s: NumMap;
          f: NumMap;
        }
      >();

      for (const coverageHit of coverageHits) {
        // 去掉插桩路径前缀，得到相对路径作为 key
        const normalizedPath = coverageHit.rawFilePath.startsWith(
          instrumentCwdPrefix,
        )
          ? coverageHit.rawFilePath.slice(instrumentCwdPrefix.length)
          : coverageHit.rawFilePath;

        if (!hitDataByFile.has(normalizedPath)) {
          hitDataByFile.set(normalizedPath, {
            s: {},
            f: {},
          });
        }
        const fileHitData = hitDataByFile.get(normalizedPath)!;
        fileHitData.s = addMaps(fileHitData.s, ensureNumMap(coverageHit.s));
        fileHitData.f = addMaps(fileHitData.f, ensureNumMap(coverageHit.f));
      }

      // 存储该 commit 的 hit 数据和 fileCoverageMap
      commitDataMap.set(sha, {
        hitDataByFile,
        fileCoverageMap,
      });

      // 与 nowSha 进行比较
      const fileComparisons: any[] = [];

      // 遍历 nowSha 的文件
      for (const [
        filePath,
        nowShaFileCoverage,
      ] of nowShaFileCoverageMap.entries()) {
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
        const fileContentHashEqual =
          nowShaFileCoverage.fileContentHash ===
          otherFileCoverage.fileContentHash;

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
        for (const [statementId, statement] of Object.entries(
          nowShaStatementMap,
        )) {
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
        for (const [statementId, statement] of Object.entries(
          otherStatementMap,
        )) {
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
          reason:
            | 'nowShaMultiple'
            | 'otherMultiple'
            | 'nowShaMissing'
            | 'otherMissing';
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
          mergeableStatements:
            mergeableStatements.length > 0 ? mergeableStatements : undefined,
          nonMergeableStatements:
            nonMergeableStatements.length > 0
              ? nonMergeableStatements
              : undefined,
          canMerge,
        });
      }

      comparisonResults.push({
        commitSha: sha,
        fileComparisons,
      });
    }

    // 合并所有 commit 的 hit 数据到 nowSha 的 map 数据上
    // 首先复制 nowSha 的 map 数据，并添加 hit 数据
    const mergedCoverageData: Record<string, any> = {};

    for (const [
      filePath,
      nowShaFileCoverage,
    ] of nowShaFileCoverageMap.entries()) {
      const nowShaHitData = nowShaHitDataByFile.get(filePath);

      if (!nowShaHitData) {
        // 如果没有 hit 数据，跳过
        continue;
      }

      // 初始化合并后的数据
      mergedCoverageData[filePath] = {
        ...nowShaFileCoverage,
        s: { ...nowShaHitData.s },
        f: { ...nowShaHitData.f },
        b: {},
        branchMap: {},
      };
    }

    // 遍历其他 commit，合并 hit 数据
    for (const [commitSha, commitData] of commitDataMap.entries()) {
      // 找到对应的比较结果
      const comparisonResult = comparisonResults.find(
        (r) => r.commitSha === commitSha,
      );
      if (!comparisonResult) continue;

      for (const fileComp of comparisonResult.fileComparisons) {
        const filePath = fileComp.filePath;
        const commitFileHitData = commitData.hitDataByFile.get(filePath);

        if (!commitFileHitData) continue;

        const mergedFileData = mergedCoverageData[filePath];
        if (!mergedFileData) continue;

        if (fileComp.status === 'fileContentHashEqual') {
          // 文件 contentHash 相同，直接合并所有 hit 数据
          mergedFileData.s = addMaps(mergedFileData.s, commitFileHitData.s);
          mergedFileData.f = addMaps(mergedFileData.f, commitFileHitData.f);
        } else if (
          fileComp.status === 'fileContentHashDifferent' &&
          fileComp.canMerge
        ) {
          // 文件 contentHash 不同，但语句可以合并，根据 mergeableStatements 映射合并
          if (
            !fileComp.mergeableStatements ||
            fileComp.mergeableStatements.length === 0
          )
            continue;

          // 获取 other commit 的 fileCoverageMap
          const otherFileCoverage = commitData.fileCoverageMap.get(filePath);
          if (!otherFileCoverage) continue;

          const otherStatementMap = otherFileCoverage.statementMap || {};
          const otherStmtIdToHash = new Map<string, string>();
          for (const [stmtId, stmt] of Object.entries(otherStatementMap)) {
            const stmtData = stmt as any;
            if (stmtData && stmtData.contentHash) {
              otherStmtIdToHash.set(stmtId, stmtData.contentHash);
            }
          }

          // 构建 nowSha 的 contentHash -> statementId 映射（只包含可合并的）
          const mergeableHashToNowShaStmtId = new Map<string, string>();
          for (const mergeableStmt of fileComp.mergeableStatements) {
            mergeableHashToNowShaStmtId.set(
              mergeableStmt.contentHash,
              mergeableStmt.nowShaStatementId,
            );
          }

          // 合并 hit 数据：遍历 other commit 的 hit 数据，如果对应的 statement 可以合并，则累加到 nowSha 的对应 statement 上
          for (const [otherStmtId, otherCount] of Object.entries(
            commitFileHitData.s,
          )) {
            const contentHash = otherStmtIdToHash.get(otherStmtId);
            if (!contentHash) continue;

            const nowShaStmtId = mergeableHashToNowShaStmtId.get(contentHash);
            if (!nowShaStmtId) continue;

            // 累加到 nowSha 的对应 statement
            mergedFileData.s[nowShaStmtId] =
              (mergedFileData.s[nowShaStmtId] || 0) + otherCount;
          }

          // 处理函数（functions）- 类似逻辑
          const otherFnMap = otherFileCoverage.fnMap || {};
          const otherFnIdToHash = new Map<string, string>();
          for (const [fnId, fn] of Object.entries(otherFnMap)) {
            const fnData = fn as any;
            if (fnData && fnData.contentHash) {
              otherFnIdToHash.set(fnId, fnData.contentHash);
            }
          }

          const nowShaFnMap = mergedFileData.fnMap || {};
          const mergeableFnHashToNowShaFnId = new Map<string, string>();
          // 这里简化处理，假设函数的合并逻辑类似（实际可能需要单独处理）
          for (const [nowShaFnId, fn] of Object.entries(nowShaFnMap)) {
            const fnData = fn as any;
            if (fnData && fnData.contentHash) {
              // 检查 other 中是否有相同 contentHash 的函数
              for (const [otherFnId, otherFn] of Object.entries(otherFnMap)) {
                const otherFnData = otherFn as any;
                if (
                  otherFnData &&
                  otherFnData.contentHash === fnData.contentHash
                ) {
                  mergeableFnHashToNowShaFnId.set(
                    fnData.contentHash,
                    nowShaFnId,
                  );
                  break;
                }
              }
            }
          }

          for (const [otherFnId, otherCount] of Object.entries(
            commitFileHitData.f,
          )) {
            const contentHash = otherFnIdToHash.get(otherFnId);
            if (!contentHash) continue;

            const nowShaFnId = mergeableFnHashToNowShaFnId.get(contentHash);
            if (!nowShaFnId) continue;

            mergedFileData.f[nowShaFnId] =
              (mergedFileData.f[nowShaFnId] || 0) + otherCount;
          }
        }
      }
    }

    // 重新映射覆盖率数据
    const remappedCoverage = await remapCoverageByOld(mergedCoverageData);

    // 构建 diffList 的 path -> additions 映射
    const diffListMap = new Map<string, number[]>();
    for (const diff of diffList) {
      diffListMap.set(diff.path, diff.additions as number[]);
    }

    // 标准化路径并过滤最终结果
    const normalizedCoverage: Record<string, any> = {};

    for (const [filePath, fileCoverage] of Object.entries(remappedCoverage)) {
      // 去掉 key 中的 instrumentCwd 前缀
      const normalizedPath = filePath.startsWith(nowShaInstrumentCwdPrefix)
        ? filePath.slice(nowShaInstrumentCwdPrefix.length)
        : filePath;

      // 从 diffList 中获取该文件的新增行数组
      const additions = diffListMap.get(normalizedPath) || [];

      normalizedCoverage[normalizedPath] = {
        ...(fileCoverage as Record<string, any>),
        path: normalizedPath,
        diff: {
          additions,
        },
      };
    }

    const finalCoverage = testExclude(
      normalizedCoverage,
      JSON.stringify({
        exclude: ['dist/**'],
      }),
    );

    return {
      success: true,
      baseCommit: nowSha,
      comparisonResults,
      coverage: finalCoverage,
    };
  }
}

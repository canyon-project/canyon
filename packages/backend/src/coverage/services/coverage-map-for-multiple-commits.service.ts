import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { generateObjectSignature } from '../../collect/helpers/generateObjectSignature';
import { extractIstanbulData } from '../../helpers/coverage-map-util';
import { addMaps, ensureNumMap } from '../../helpers/coverage-merge.util';
import { testExclude } from '../../helpers/test-exclude';
import { PrismaService } from '../../prisma/prisma.service';
import { NumMap } from '../../task/task.types';
import { aggregateForCommits } from '../helpers/aggregate-for-commits';
import { CoverageMapStoreService } from './coverage.map-store.service';

@Injectable()
export class CoverageMapForMultipleCommitsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly coverageMapStoreService: CoverageMapStoreService,
  ) {}

  private async getGitLabCfg() {
    const base = await this.configService.get('INFRA.GITLAB_BASE_URL');
    const token = await this.configService.get('INFRA.GITLAB_PRIVATE_TOKEN');
    if (!base || !token) throw new BadRequestException('GitLab 配置缺失');
    return { base, token };
  }

  /**
   * 获取两个 commit 之间的所有 commit SHA 列表（包含 from 和 to）
   * 使用 GitLab API 的 compare 接口
   */
  private async getCommitsBetween({
    repoID,
    fromSha,
    toSha,
  }: {
    repoID: string;
    fromSha: string;
    toSha: string;
  }): Promise<string[]> {
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
    return commits.map((c: { id?: string }) => c.id).filter(Boolean);
  }

  async invoke({
    provider,
    repoID,
    subjectID, // 格式: commit1...commit2，其中 commit1 是 from，commit2 是 to（基线）
    buildTarget,
    reportProvider,
    reportID,
    filePath,
    onlyChanged = true, // 默认为 true，只有显式设置为 false 才返回全部
  }: {
    provider: string;
    repoID: string;
    subjectID: string; // commit1...commit2，commit1 是 from，commit2 是基线
    buildTarget?: string;
    reportProvider?: string;
    reportID?: string;
    filePath?: string;
    onlyChanged?: boolean;
  }) {
    // 解析 subjectID: commit1...commit2
    // commit1 是 from，commit2 是 to（基线）
    const parts = subjectID.split('...');
    if (parts.length !== 2) {
      throw new BadRequestException(
        'subjectID 格式错误，应为 commit1...commit2',
      );
    }
    const [fromSha, toSha] = parts;
    if (!fromSha || !toSha) {
      throw new BadRequestException('subjectID 格式错误，from 和 to 不能为空');
    }

    const fromShaTrimmed = fromSha.trim();
    const toShaTrimmed = toSha.trim();

    // 从 diff 表获取变更文件列表（默认只返回变更的文件）
    let changedFilePaths: Set<string> | null = null;
    // 存储文件路径到 additions 的映射
    const filePathToAdditions = new Map<string, number[]>();
    if (onlyChanged) {
      // 构建查询条件
      const diffWhere: any = {
        provider,
        repo_id: repoID,
        subject_id: subjectID,
        subject: 'multiple-commits',
      };

      // 如果提供了 filePath，只查询该文件的变更行
      if (filePath) {
        diffWhere.path = filePath;
      }

      const diffRecords = await this.prisma.diff.findMany({
        where: diffWhere,
        select: {
          path: true,
          additions: true,
        },
      });
      changedFilePaths = new Set(diffRecords.map((d) => d.path));
      // 构建文件路径到 additions 的映射
      for (const record of diffRecords) {
        filePathToAdditions.set(record.path, record.additions);
      }
    }

    // 获取从 fromSha 到 toSha 之间的所有 commit
    const commitShas = await this.getCommitsBetween({
      repoID,
      fromSha: fromShaTrimmed,
      toSha: toShaTrimmed,
    });

    if (commitShas.length === 0) {
      throw new BadRequestException('未找到任何 commit');
    }

    // 确保 fromSha 在列表中，如果不在则添加到开头
    if (!commitShas.includes(fromShaTrimmed)) {
      commitShas.unshift(fromShaTrimmed);
    }
    // 确保 toSha（基线）在列表中，如果不在则添加
    if (!commitShas.includes(toShaTrimmed)) {
      commitShas.push(toShaTrimmed);
    }

    // 对每个 commit 获取覆盖率数据
    const coverageByCommit: Record<string, Record<string, any>> = {};

    // 如果 onlyChanged 为 true 且有变更文件列表，只查询这些文件；否则查询所有文件
    const filesToQuery =
      onlyChanged && changedFilePaths && changedFilePaths.size > 0
        ? Array.from(changedFilePaths)
        : null;
    for (const sha of commitShas) {
      try {
        // 生成 coverageID 和 versionID
        const coverageID = generateObjectSignature({
          provider,
          repoID,
          sha,
          buildTarget: buildTarget || '',
          reportProvider,
          reportID,
        });
        const versionID = generateObjectSignature({
          provider,
          repoID,
          sha,
          buildTarget: buildTarget || '',
        });

        // 先检查 Coverage 表是否存在数据，如果不存在则跳过（避免查询耗时的 coverageMapRelation）
        const coverageCheck = await this.prisma.coverage.findFirst({
          where: {
            versionID: versionID,
          },
          select: {
            id: true,
          },
        });

        // 如果没有 coverage 数据，跳过这个 commit
        if (!coverageCheck) {
          console.warn(`commit ${sha} 没有覆盖率数据，跳过`);
          coverageByCommit[sha] = {};
          continue;
        }

        // 构建查询条件
        const qb: any = {
          versionID: versionID,
        };

        // 处理文件路径过滤
        if (filesToQuery && filesToQuery.length > 0) {
          // 如果 onlyChanged 为 true 且有变更文件列表，使用文件列表过滤
          qb['filePath'] = {
            in: filesToQuery,
          };
        } else if (filePath) {
          // 如果指定了单个 filePath，使用单个文件路径
          qb['filePath'] = filePath;
        }

        // 查询 coverageMapRelation
        const relationsAll = await this.prisma.coverageMapRelation.findMany({
          where: qb,
        });

        const pathToHash = new Map<string, string>();
        for (const r of relationsAll) {
          if (!pathToHash.has(r.filePath)) {
            pathToHash.set(
              r.filePath,
              `${r.coverageMapHashID}|${r.contentHashID}`,
            );
          }
        }

        const hashList = relationsAll.map(
          (x) => `${x.coverageMapHashID}|${x.contentHashID}`,
        );
        const hashToMap =
          await this.coverageMapStoreService.fetchCoverageMapsFromClickHouse(
            hashList,
          );

        // 查询 hit 数据
        const hitQuery: any = {
          versionID: versionID,
        };
        // 处理文件路径过滤（与 coverageMapRelation 查询保持一致）
        if (filesToQuery && filesToQuery.length > 0) {
          hitQuery['filePath'] = {
            in: filesToQuery,
          };
        } else if (filePath) {
          hitQuery['filePath'] = filePath;
        }
        const rows = await this.prisma.coverHitAgg.findMany({
          where: hitQuery,
        });

        // 按 filePath 分组并合并多个 coverageID 的数据
        const mergedRows = new Map<
          string,
          {
            filePath: string;
            s: NumMap;
            f: NumMap;
            latestTs: Date;
          }
        >();

        for (const r of rows || []) {
          const filePath = r.filePath;
          const sMap = ensureNumMap(r.s);
          const fMap = ensureNumMap(r.f);
          const ts =
            r.latestTs instanceof Date ? r.latestTs : new Date(r.latestTs);

          const existing = mergedRows.get(filePath);
          if (!existing) {
            mergedRows.set(filePath, {
              filePath,
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

        // 组装最终结果：合并命中、补齐 0 值、转换分支为数组
        const transformedCoverage: Record<string, any> = {};
        for (const mergedRow of mergedRows.values()) {
          const path = mergedRow.filePath;
          const structure = hashToMap.find((i) => {
            return i.hash === pathToHash.get(path);
          });

          if (structure) {
            transformedCoverage[path] = {
              path,
              ...extractIstanbulData(structure),
              s: mergedRow.s,
              f: mergedRow.f,
              contentHash: structure.hash.split('|')[1],
            };
          }
        }

        coverageByCommit[sha] = transformedCoverage;
      } catch (error) {
        // 如果某个 commit 没有覆盖率数据，跳过
        console.warn(`无法获取 commit ${sha} 的覆盖率数据:`, error);
        coverageByCommit[sha] = {};
      }
    }

    // 使用 aggregateForCommits 进行聚合，以 toSha（commit2）为基线
    if (!coverageByCommit[toShaTrimmed]) {
      throw new BadRequestException(
        `基线 commit ${toShaTrimmed} 没有覆盖率数据`,
      );
    }

    const aggregated = aggregateForCommits(coverageByCommit, toShaTrimmed);

    // 如果 onlyChanged 为 true 且有变更文件列表，只返回变更的文件
    // 注意：由于已经在查询时过滤了文件，这里理论上不需要再次过滤
    // 但为了保险起见，还是保留过滤逻辑
    let result = aggregated;
    if (onlyChanged && changedFilePaths && changedFilePaths.size > 0) {
      result = {};
      for (const [filePath, fileData] of Object.entries(aggregated)) {
        if (changedFilePaths.has(filePath)) {
          result[filePath] = fileData;
        }
      }
    }

    // 为每个覆盖率数据添加 change 字段（包含 additions）
    for (const [filePath, fileData] of Object.entries(result)) {
      const additions = filePathToAdditions.get(filePath);
      if (additions !== undefined) {
        (result[filePath] as any) = {
          ...fileData,
          change: {
            additions,
          },
        };
      }
    }

    // 返回格式与 coverage-map-for-commit.service.ts 保持一致
    // aggregateForCommits 返回的是 CoverageByFile，格式已经正确
    const filtered = testExclude(
      result,
      JSON.stringify({
        exclude: ['dist/**'],
      }),
    );
    return filtered;
  }
}

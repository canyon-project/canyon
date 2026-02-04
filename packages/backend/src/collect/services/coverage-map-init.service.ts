import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { logger } from '../../logger';
import { PrismaService } from '../../prisma/prisma.service';
import { PrismaSqliteService } from '../../prisma/prisma-sqlite.service';
import { CoverageMapInitDto } from '../dto/coverage-map-init.dto';
import { remapCoverageByOld } from '../helpers/canyon-data';
import { generateSecureId } from '../helpers/coverageID';
import { generateObjectSignature } from '../helpers/generateObjectSignature';
import { encodeObjectToCompressedBuffer } from '../helpers/transform';

@Injectable()
export class CoverageMapInitService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaSqlite: PrismaSqliteService,
    private readonly configService: ConfigService,
  ) {}

  async init(coverageMapInitDto: CoverageMapInitDto) {
    const { coverage, instrumentCwd } = coverageMapInitDto;

    // 插入 coverage 表
    // 备注：如果存在就更新build信息
    const coverageCreateRes = await this.insertCoverage(coverageMapInitDto);

    // 上报 commit 信息
    await this.insertCommit(coverageMapInitDto);

    // 尝试插入 Cr 表（PR/MR 信息）
    await this.insertCr(coverageMapInitDto);

    // 如果map里也没input source的话那就能直接插入hit
    await this.insertMap({
      coverage: coverage,
      // coverageID,
      buildHash: coverageCreateRes.buildHash,
      instrumentCwd,
    });

    // 再插入初始hit

    const hitEntities = Object.entries(coverage).map(
      ([filePath, entry]: any) => {
        const s = entry?.s || {};
        const f = entry?.f || {};
        const scene = {};
        const sceneKey = this.calculateSceneKey(scene);
        return {
          id: `${coverageCreateRes.buildHash}|${sceneKey}|${filePath}`,
          sceneKey: sceneKey,
          buildHash: coverageCreateRes.buildHash,
          rawFilePath: filePath,
          s,
          f,
          b: {},
          inputSourceMap: entry.inputSourceMap ? 1 : 0,
          createdAt: new Date(),
        };
      },
    );
    await this.prisma.coverageHit.createMany({
      data: hitEntities,
      skipDuplicates: true,
    });

    logger({
      type: 'info',
      title: 'CoverageMapInit',
      message: 'Coverage map init',
      addInfo: {
        id: coverageCreateRes.id,
        buildHash: coverageCreateRes.buildHash,
        instrumentCwd,
      },
    });

    return {
      success: true,
      message: 'Coverage map initialized',
      data: coverageCreateRes,
    };
  }

  /**
   * 计算 buildHash（五要素：sha, provider, repoID, instrumentCwd, buildTarget）
   */
  private calculateBuildHash(
    sha: string,
    provider: string,
    repoID: string,
    instrumentCwd: string,
    buildTarget?: string,
  ): string {
    const buildHashData = {
      sha,
      provider,
      repoID,
      instrumentCwd,
      buildTarget: buildTarget || '',
    };
    return generateObjectSignature(buildHashData);
  }

  /**
   * 计算 sceneKey（从 scene 对象生成）
   */
  private calculateSceneKey(scene: Record<string, any>): string {
    return generateObjectSignature(scene);
  }

  /**
   * 插入或更新 commit 信息
   * 通过调用 GitLab/GitHub API 获取 commit 详细信息
   */
  /**
   * 插入或更新 Cr 表（PR/MR 信息）
   * 从 build.event 中解析 PR/MR 信息
   */
  async insertCr(coverageMapInitDto: CoverageMapInitDto) {
    const { provider, repoID, build } = coverageMapInitDto;

    if (!build || !provider || !repoID || !build.event) {
      return;
    }

    try {
      // 尝试解析 build.event 为 JSON
      let eventData: any;
      try {
        eventData =
          typeof build.event === 'string'
            ? JSON.parse(build.event)
            : build.event;
      } catch (error) {
        // 解析失败，跳过
        return;
      }

      // 尝试从 event 中提取 PR/MR ID
      let prOrMrId: string | null = null;
      if (eventData.pull_request?.number) {
        prOrMrId = String(eventData.pull_request.number);
      } else if (eventData.merge_request?.id) {
        prOrMrId = String(eventData.merge_request.id);
      } else if (eventData.merge_request?.iid) {
        prOrMrId = String(eventData.merge_request.iid);
      }

      // 如果有 PR/MR ID，则插入或更新 Cr 表
      if (prOrMrId) {
        const crId = `${provider}${repoID}${prOrMrId}`;

        await (this.prisma as any).cr.upsert({
          where: { id: crId },
          create: {
            id: crId,
            content: eventData,
          },
          update: {
            content: eventData,
          },
        });

        logger({
          type: 'info',
          title: 'CrInsert',
          message: 'Cr inserted/updated',
          addInfo: {
            crId,
            provider,
            repoID,
            prOrMrId,
          },
        });
      }
    } catch (error) {
      // 如果出错，记录日志但不影响主流程
      logger({
        type: 'warn',
        title: 'CrInsert',
        message: 'Failed to insert Cr',
        addInfo: {
          provider,
          repoID,
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }

  /**
   * 插入 diff 表数据
   * 从 build.event 中提取 PR/MR 信息，填充 from、to、subject_id 等字段
   */
  async insertDiff(
    coverageMapInitDto: CoverageMapInitDto,
    diffData: Array<{ path: string; additions: number[]; deletions: number[] }>,
  ) {
    const { provider, repoID, build, sha } = coverageMapInitDto;

    if (!build || !build.event) {
      logger({
        type: 'warn',
        title: 'DiffInsert',
        message: 'No build.event found, skipping diff insert',
      });
      return;
    }

    try {
      // 尝试解析 build.event 为 JSON
      let eventData: any;
      try {
        eventData =
          typeof build.event === 'string'
            ? JSON.parse(build.event)
            : build.event;
      } catch (error) {
        logger({
          type: 'warn',
          title: 'DiffInsert',
          message: 'Failed to parse build.event',
          addInfo: {
            error: error instanceof Error ? error.message : String(error),
          },
        });
        return;
      }

      // 从 event 中提取 PR/MR 信息
      let fromSha = '';
      let toSha = sha || '';
      let subjectId = '';
      let subject = 'cr';

      // GitHub PR
      if (eventData.pull_request) {
        const pr = eventData.pull_request;
        fromSha = pr.base?.sha || '';
        toSha = pr.head?.sha || sha || '';
        subjectId = String(pr.number || '');
        subject = 'pr';
      }
      // GitLab MR
      else if (eventData.merge_request) {
        const mr = eventData.merge_request;
        fromSha = mr.diff_refs?.base_sha || '';
        toSha = mr.diff_refs?.head_sha || sha || '';
        subjectId = String(mr.iid || mr.id || '');
        subject = 'merge_request';
      }
      // 如果没有找到 PR/MR 信息，使用默认值
      else {
        logger({
          type: 'warn',
          title: 'DiffInsert',
          message: 'No PR/MR information found in build.event',
        });
        // 如果没有 PR/MR，可能只是普通的 commit，使用当前 sha 作为 to
        toSha = sha || '';
      }

      // 如果没有 subjectId，跳过插入
      if (!subjectId) {
        logger({
          type: 'warn',
          title: 'DiffInsert',
          message: 'No subject_id found, skipping diff insert',
        });
        return;
      }

      // 构建 diff 记录数组
      const diffRecords = diffData.map((item) => ({
        provider,
        repo_id: repoID,
        from: fromSha,
        to: toSha,
        path: item.path,
        additions: item.additions,
        deletions: item.deletions,
        subject,
        subject_id: subjectId,
      }));

      // 插入 diff 记录
      await this.prisma.diff.createMany({
        data: diffRecords,
        skipDuplicates: true,
      });

      logger({
        type: 'info',
        title: 'DiffInsert',
        message: 'Diff records inserted',
        addInfo: {
          provider,
          repoID,
          subject,
          subjectId,
          count: diffRecords.length,
        },
      });
    } catch (error) {
      // 如果出错，记录日志但不影响主流程
      logger({
        type: 'warn',
        title: 'DiffInsert',
        message: 'Failed to insert diff',
        addInfo: {
          provider,
          repoID,
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }

  async insertCommit(coverageMapInitDto: CoverageMapInitDto) {
    const { sha, provider, repoID } = coverageMapInitDto;

    if (!sha || !provider || !repoID) {
      return;
    }

    // 生成 commit id: provider+repoID+sha
    const commitId = `${provider}${repoID}${sha}`;

    // 检查 commit 是否已存在
    const existingCommit = await this.prisma.commit.findUnique({
      where: { id: commitId },
    });

    if (existingCommit) {
      // 如果已存在，跳过
      return;
    }

    try {
      let commitMessage = '';
      let authorName: string | null = null;
      let authorEmail: string | null = null;
      let createdAt = new Date();

      // 根据 provider 调用不同的 API
      if (provider === 'gitlab' || provider.startsWith('gitlab')) {
        const base = await this.configService.get('INFRA.GITLAB_BASE_URL');
        const token = await this.configService.get(
          'INFRA.GITLAB_PRIVATE_TOKEN',
        );

        if (base && token) {
          const url = `${base}/api/v4/projects/${repoID}/repository/commits/${sha}`;
          const resp = await axios
            .get(url, {
              headers: {
                'PRIVATE-TOKEN': token,
              },
            })
            .then(({ data }) => data);

          commitMessage = resp.message || '';
          authorName = resp.author_name || null;
          authorEmail = resp.author_email || null;
          createdAt = resp.authored_date
            ? new Date(resp.authored_date)
            : resp.created_at
              ? new Date(resp.created_at)
              : new Date();
        }
      } else if (provider === 'github' || provider.startsWith('github')) {
        const token = await this.configService.get(
          'INFRA.GITHUB_PRIVATE_TOKEN',
        );

        if (token) {
          // GitHub API 需要先解析 owner/repo
          // 这里简化处理，假设 repoID 可能是 owner/repo 格式或数字 ID
          let owner: string;
          let repo: string;

          if (repoID.includes('/')) {
            [owner, repo] = repoID.split('/');
          } else {
            // 如果是数字 ID，需要通过 API 解析（这里简化，直接使用 repoID）
            owner = '';
            repo = repoID;
          }

          if (owner && repo) {
            const url = `https://api.github.com/repos/${owner}/${repo}/commits/${sha}`;
            const resp = await axios
              .get(url, {
                headers: {
                  Authorization: `token ${token}`,
                  Accept: 'application/vnd.github.v3+json',
                },
              })
              .then(({ data }) => data);

            commitMessage = resp.commit?.message || '';
            authorName = resp.commit?.author?.name || null;
            authorEmail = resp.commit?.author?.email || null;
            createdAt = resp.commit?.author?.date
              ? new Date(resp.commit.author.date)
              : resp.commit?.committer?.date
                ? new Date(resp.commit.committer.date)
                : new Date();
          }
        }
      }

      // 插入 commit 记录
      await this.prisma.commit.create({
        data: {
          id: commitId,
          sha,
          provider,
          repoID,
          commitMessage,
          authorName,
          authorEmail,
          createdAt,
        },
      });

      logger({
        type: 'info',
        title: 'CommitInsert',
        message: 'Commit inserted',
        addInfo: {
          commitId,
          sha,
        },
      });
    } catch (error) {
      // 如果出错，记录日志但不影响主流程
      logger({
        type: 'warn',
        title: 'CommitInsert',
        message: 'Failed to insert commit',
        addInfo: {
          commitId,
          sha,
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }

  async insertCoverage(coverageMapInitDto: CoverageMapInitDto) {
    const {
      sha,
      provider,
      repoID,
      instrumentCwd,
      buildTarget,
      build,
      coverage,
      diff,
    } = coverageMapInitDto;

    // 如果有 diff，尝试插入 diff 表
    if (diff && Array.isArray(diff) && diff.length > 0) {
      await this.insertDiff(coverageMapInitDto, diff);
    }

    // 计算 buildHash
    const buildHash = this.calculateBuildHash(
      sha,
      provider,
      repoID,
      instrumentCwd,
      buildTarget,
    );

    // 从 build 中提取 scene 信息，如果没有则使用默认值
    // 根据 schema 注释，scene 应该包含 source, type, env, trigger
    const scene = {};

    // 计算 sceneKey
    const sceneKey = this.calculateSceneKey(scene);

    // 生成 id = buildHash | sceneKey
    const id = `${buildHash}|${sceneKey}`;

    // 查找现有记录
    const existingCoverage = await this.prisma.coverage.findUnique({
      where: { id },
    });

    const now = new Date();
    let coverageCreateRes;

    if (existingCoverage) {
      // 如果记录存在，将新的 build 信息 push 到 builds 数组中
      const existingBuilds = Array.isArray(existingCoverage.builds)
        ? existingCoverage.builds
        : [];

      const updatedBuilds = [...existingBuilds];
      if (build) {
        updatedBuilds.push(build);
      }

      coverageCreateRes = await this.prisma.coverage.update({
        where: { id },
        data: {
          builds: updatedBuilds,
          updatedAt: now,
        },
      });
    } else {
      // 如果记录不存在，创建新记录，builds 初始化为数组
      const initialBuilds = build ? [build] : [];

      coverageCreateRes = await this.prisma.coverage.create({
        data: {
          id,
          buildHash,
          provider,
          repoID,
          sha,
          buildTarget: buildTarget || '',
          instrumentCwd,
          sceneKey,
          scene,
          builds: initialBuilds,
          createdAt: now,
          updatedAt: now,
        },
      });
    }

    return coverageCreateRes;
  }

  async insertMap({
    coverage,
    // coverageID,
    buildHash,
    instrumentCwd,
  }: any) {
    const originalCoverage = await remapCoverageByOld(coverage);

    const mapItems = Object.entries(coverage).map(([filePath, entry]: any) => {
      const chunkMap = {
        statementMap: entry.statementMap,
        fnMap: entry.fnMap,
        branchMap: entry.branchMap,
      };

      const coverageMapHash = generateObjectSignature(chunkMap);
      const fileContentHash = entry.contentHash || '';

      const originalEntry: any = Object.values(originalCoverage).find(
        (iiii: any) => iiii.oldPath === filePath,
      );

      if (entry.inputSourceMap) {
        if (originalEntry) {
          // const originalChunkMap = {
          //   statementMap: originalEntry.statementMap,
          //   fnMap: originalEntry.fnMap,
          //   branchMap: originalEntry.branchMap,
          // };
          const inputSourceMapCoverageMapHash = generateObjectSignature({
            ...chunkMap,
            inputSourceMap: 1,
          });
          return {
            map: chunkMap,
            // origin: chunkMap, // remap 后的数据作为 origin
            // restore: originalChunkMap, // 原来的数据作为 restore
            createdAt: new Date(),
            coverageMapHash: inputSourceMapCoverageMapHash,
            fileContentHash: fileContentHash,
            fullFilePath: originalEntry.path,
            sourceMap: entry.inputSourceMap,
            restoreFullFilePath: originalEntry.oldPath,
          };
        }
      }
      // 普通情况：没有 oldPath
      return {
        map: chunkMap,
        createdAt: new Date(),
        coverageMapHash: coverageMapHash,
        fileContentHash: fileContentHash,
        filePath: filePath.replace(instrumentCwd + '/', ''),
        fullFilePath: filePath,
      };
    });

    const coverMapEntities = mapItems.map((item) => ({
      hash: `${item.coverageMapHash}|${item.fileContentHash}`,
      map: encodeObjectToCompressedBuffer(item.map),
      createdAt: item.createdAt,
    }));

    await this.prisma.coverageMap.createMany({
      data: coverMapEntities,
      skipDuplicates: true,
    });

    const relationItems = mapItems.map((item) => ({
      id: `${buildHash}|${item.fullFilePath}`,
      buildHash,
      fullFilePath: item.fullFilePath,
      restoreFullFilePath: item.restoreFullFilePath,
      coverageMapHash: item.coverageMapHash,
      sourceMapHash: (item as any).sourceMap
        ? generateObjectSignature((item as any).sourceMap)
        : '',
      fileContentHash: item.fileContentHash,
      sourceMap: (item as any).sourceMap,
    }));
    await this.prisma.coverageMapRelation.createMany({
      data: relationItems.map((item) => ({
        id: item.id,
        buildHash: item.buildHash,
        fullFilePath: item.fullFilePath,
        restoreFullFilePath: item.restoreFullFilePath || '',
        coverageMapHash: item.coverageMapHash,
        sourceMapHash: item.sourceMapHash,
        fileContentHash: item.fileContentHash,
      })),
      skipDuplicates: true,
    });

    await this.prisma.coverageSourceMap.createMany({
      data: relationItems
        .filter((i) => i.sourceMap)
        .map((item) => ({
          hash: generateObjectSignature(item.sourceMap as any),
          sourceMap: encodeObjectToCompressedBuffer(item.sourceMap) as any,
        })),
      skipDuplicates: true,
    });
    return {
      success: true,
      message: 'Coverage map inserted',
    };
  }
}

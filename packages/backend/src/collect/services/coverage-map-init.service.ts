import { Injectable } from '@nestjs/common';
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
  ) {}

  async init(coverageMapInitDto: CoverageMapInitDto) {
    const { coverage, instrumentCwd } = coverageMapInitDto;

    // 插入 coverage 表
    // 备注：如果存在就更新build信息
    const coverageCreateRes = await this.insertCoverage(coverageMapInitDto);

    // 上报 commit 信息
    await this.insertCommit(coverageMapInitDto);

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
   */
  async insertCommit(coverageMapInitDto: CoverageMapInitDto) {
    const { sha, provider, repoID, build } = coverageMapInitDto;

    if (!sha || !provider || !repoID) {
      return;
    }

    // 生成 commit id: provider+repoID+sha
    const commitId = `${provider}${repoID}${sha}`;

    // 尝试从 build 对象中提取 commit 信息
    const commitMessage =
      (build as any)?.commitMessage ||
      (build as any)?.message ||
      (build as any)?.commit?.message ||
      '';
    const authorName =
      (build as any)?.authorName ||
      (build as any)?.author?.name ||
      (build as any)?.commit?.author?.name ||
      null;
    const authorEmail =
      (build as any)?.authorEmail ||
      (build as any)?.author?.email ||
      (build as any)?.commit?.author?.email ||
      null;
    const createdAt = (build as any)?.commitCreatedAt
      ? new Date((build as any).commitCreatedAt)
      : (build as any)?.commit?.createdAt
        ? new Date((build as any).commit.createdAt)
        : new Date();

    // 使用 upsert 插入或更新 commit 记录
    try {
      await this.prisma.commit.create({
        data: {
          id: commitId,
          sha,
          provider,
          repoID,
          commitMessage: commitMessage || '',
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
    } = coverageMapInitDto;

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
            map:chunkMap,
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

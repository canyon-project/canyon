import { Injectable } from '@nestjs/common';
import { isUndefined } from '@nestjs/common/utils/shared.utils';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { CoverageClientDto } from '../dto/coverage-client.dto';
import { remapCoverageByOld } from '../helpers/canyon-data';
import { checkCoverageType } from '../helpers/checkCoverageType';
import { generateSecureId } from '../helpers/coverageID';
import { generateObjectSignature } from '../helpers/generateObjectSignature';
import { separateCoverage } from '../helpers/separateCoverage';
import { encodeObjectToCompressedBuffer } from '../helpers/transform';

type CoverageKind = 'hit' | 'map';
type HitCounters = Record<string, number>;
interface HitFileCoverageEntry {
  s?: HitCounters;
  f?: HitCounters;
  b?: unknown;
  inputSourceMap?: number;
}
type HitCoverage = Record<string, HitFileCoverageEntry>;

interface MapFileCoverageEntry {
  statementMap: unknown;
  fnMap: unknown;
  branchMap: unknown;
  inputSourceMap?: unknown;
  contentHash?: string;
}
type MapCoverage = Record<string, MapFileCoverageEntry>;

interface InsertHitParams {
  coverage: HitCoverage;
  coverageID: string;
  versionID: string;
  instrumentCwd: string;
}

interface InsertMapParams {
  coverage: MapCoverage;
  coverageID: string;
  versionID: string;
  instrumentCwd: string;
}

export interface InsertCoverageResult {
  result: 'success';
  coverageID: string;
}
@Injectable()
export class CoverageClientService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async invoke(reporter: string, coverageClientDto: CoverageClientDto) {
    await this.prisma.log.create({
      data: {
        content: {
          ...coverageClientDto,
          coverage: {},
        },
      },
    });

    const {
      provider,
      sha,
      repoID,
      coverage,
      instrumentCwd,
      reportID, // Option
      branch, // Option
      compareTarget, // Option
      // buildID, // Option
      // buildProvider, // Option
      reportProvider, // Option
      buildTarget, // Option 默认空字符串
    } = coverageClientDto;

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

    // 第二步：检查coverage类型
    const coverageType = checkCoverageType(coverage as any) as CoverageKind;
    const coverageMapRelationCount =
      await this.prisma.coverageMapRelation.count({
        where: {
          versionID,
        },
      });
    if (coverageType === 'hit' && coverageMapRelationCount === 0) {
      return {
        msg: '没map',
      };
    }

    // 第三步：插入 coverage 表
    const coverageCreateRes = await this.insertCoverage(
      reporter,
      coverageID,
      versionID,
      coverageClientDto,
    );

    if (coverageType === 'hit') {
      // 注意这个是会有inputSourceMap 1 的
      await this.insertHit({
        coverage: coverage as HitCoverage,
        coverageID,
        versionID,
        instrumentCwd,
      });
    } else {
      // 如果map里也没input source的话那就能直接插入hit
      await this.insertMap({
        coverage: coverage as MapCoverage,
        coverageID,
        versionID,
        instrumentCwd,
      });
    }
    return {};
  }

  async insertHit({
    coverage,
    coverageID,
    versionID,
    instrumentCwd,
  }: InsertHitParams): Promise<void> {
    const hitEntities = Object.entries(coverage).map(([filePath, entry]) => {
      const s: HitCounters = entry?.s || {};
      const f: HitCounters = entry?.f || {};
      return {
        id: generateSecureId(),
        coverageID,
        versionID,
        filePath: filePath.replace(instrumentCwd + '/', ''),
        s,
        f,
        b: {},
        inputSourceMap: entry.inputSourceMap ? 1 : 0,
        aggregated: false,
        ts: new Date(),
      };
    });

    await this.prisma.coverHit.createMany({
      data: hitEntities,
    });
  }

  // 尝试回溯覆盖率数据
  async tryRecoverage(coverage: MapCoverage): Promise<Record<string, any>> {
    // 第一步：如果没有 inputSourceMap，则直接返回
    if (
      Object.values(coverage).filter(({ inputSourceMap }) => inputSourceMap)
        .length === 0
    ) {
      return coverage;
    }
    // 还原覆盖率
    const remapCoverageObject = await remapCoverageByOld(coverage as any);
    return remapCoverageObject;
  }

  async insertMap({
    coverage,
    coverageID,
    versionID,
    instrumentCwd,
  }: InsertMapParams) {
    const realcoverage = await this.tryRecoverage(coverage);

    const mapItems = Object.entries(coverage).map(([filePath, entry]) => {
      const chunkMap = {
        statementMap: entry.statementMap,
        fnMap: entry.fnMap,
        branchMap: entry.branchMap,
      };

      const coverageMapHash = generateObjectSignature(chunkMap);
      const contentHash = entry.contentHash || '';

      const remappedEntry: any = Object.values(realcoverage).find(
        (item: any) => item.oldPath === filePath,
      );
      if (remappedEntry && (entry as any).inputSourceMap) {
        const inputSourceMapCoverageMapHash = generateObjectSignature({
          ...chunkMap,
          inputSourceMap: 1,
        });
        return {
          origin: {
            statementMap: remappedEntry.statementMap,
            fnMap: remappedEntry.fnMap,
            branchMap: remappedEntry.branchMap,
          },
          restore: chunkMap,
          ts: new Date(),
          coverageMapHashID: inputSourceMapCoverageMapHash,
          contentHashID: contentHash,
          filePath: remappedEntry.path.replace(instrumentCwd + '/', ''),
          fullFilePath: remappedEntry.path,
          sourceMap: (entry as any).inputSourceMap,
          oldPath: remappedEntry.oldPath,
        };
      }
      return {
        origin: chunkMap,
        restore: {},
        ts: new Date(),
        coverageMapHashID: coverageMapHash,
        contentHashID: contentHash,
        filePath: filePath.replace(instrumentCwd + '/', ''),
        fullFilePath: filePath,
      };
    });

    const coverMapEntities = mapItems.map((item) => ({
      hash: `${item.coverageMapHashID}|${item.contentHashID}`,
      origin: item.origin,
      restore: item.restore,
      ts: item.ts,
    }));

    await this.prisma.coverMap.createMany({
      // @ts-expect-errorr
      data: coverMapEntities,
      skipDuplicates: true,
    });

    const relationItems = mapItems.map((item) => ({
      id: `${versionID}|${item.filePath}`,
      versionID,
      fullFilePath: item.fullFilePath,
      filePath: item.filePath,
      restoreFullFilePath: item.oldPath || item.fullFilePath,
      coverageMapHashID: item.coverageMapHashID,
      sourceMapHashID: (item as any).sourceMap
        ? generateObjectSignature((item as any).sourceMap)
        : '',
      contentHashID: item.contentHashID,
      sourceMap: (item as any).sourceMap,
    }));

    await this.prisma.coverageMapRelation.createMany({
      data: relationItems.map((item) => ({
        id: item.id,
        versionID: item.versionID,
        fullFilePath: item.fullFilePath,
        filePath: item.filePath,
        restoreFullFilePath: item.restoreFullFilePath || '',
        coverageMapHashID: item.coverageMapHashID,
        sourceMapHashID: item.sourceMapHashID,
        contentHashID: item.contentHashID,
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

    return {};
  }

  async insertCoverage(
    reporter: string,
    coverageID: string,
    versionID: string,
    {
      provider,
      sha,
      repoID,
      instrumentCwd,
      reportID, // Option
      branch, // Option
      compareTarget, // Option
      buildID, // Option
      buildProvider, // Option
      reportProvider, // Option
      buildTarget,
    }: CoverageClientDto,
  ) {
    const coverageCreateRes = await this.prisma.coverage
      .create({
        data: {
          id: coverageID,
          provider: provider,
          repoID,
          sha,
          instrumentCwd,
          reportID: reportID,
          reportProvider: reportProvider,
          branches: branch || '',
          builds: [],
          // compareTarget: compareTarget || '',
          // buildID: buildID || '',
          // buildProvider: buildProvider || '',
          reporter: reporter,
          buildTarget: buildTarget || '',
          versionID,
          // buildProvider: '',
          // buildID: '',
          // compareTarget: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
      .catch(() => {});
    return coverageCreateRes;
  }
}

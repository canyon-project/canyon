import * as process from 'node:process';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PrismaSqliteService } from '../../prisma/prisma-sqlite.service';
import { CoverageClientDto } from '../dto/coverage-client.dto';
import { generateObjectSignature } from '../helpers/generateObjectSignature';

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
  oldPath?: string; // 如果有 oldPath，说明这是 remap 后的数据
}
type MapCoverage = Record<string, MapFileCoverageEntry>;

interface InsertHitParams {
  coverage: HitCoverage;
  coverageID: string;
  versionID: string;
  instrumentCwd: string;
  reportID?: string;
  reportProvider?: string;
}

interface InsertMapParams {
  coverage: MapCoverage;
  coverageID: string;
  versionID: string;
  instrumentCwd: string;
}

@Injectable()
export class CoverageClientService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaSqlite: PrismaSqliteService,
  ) {}

  async invoke(reporter: string, coverageClientDto: CoverageClientDto) {
    const { coverage } = coverageClientDto;

    // 1. 尝试获取coverage的第一个
    const coverageValue = Object.values(coverage)[0] as any;

    const buildHash = coverageValue.buildHash;
    const sceneKey = generateObjectSignature(coverageClientDto.scene || {});

    // 写入 SQLite 队列，由消费服务异步处理
    // payload 存储为 JSON string，因为 SQLite 不适合原生 JSON 类型
    await this.prismaSqlite.coverageQueue.create({
      data: {
        payload: JSON.stringify({
          coverage,
          buildHash,
          sceneKey,
        }),
        status: 'PENDING',
        pid: process.pid,
      },
    });

    const prismacoverage = await this.prisma.coverage.findFirst({
      where: {
        buildHash,
      },
    });

    if (!prismacoverage) {
      return {
        success: false,
        message:
          '找不到对应的 coverage 记录，请先通过 /collect/map/init 接口上传覆盖率映射数据',
      };
    }

    // 创建 coverage 记录，使用新的 id、sceneKey、scene，其他字段从 prismacoverage 复制
    // 这个操作允许失败，通过 id 来保证唯一性
    if (prismacoverage) {
      try {
        const id = `${buildHash}|${sceneKey}`;
        const scene = coverageClientDto.scene || {};
        const builds = Array.isArray(prismacoverage.builds)
          ? prismacoverage.builds
          : [];

        await this.prisma.coverage.create({
          data: {
            id,
            buildHash: prismacoverage.buildHash,
            provider: prismacoverage.provider,
            repoID: prismacoverage.repoID,
            sha: prismacoverage.sha,
            buildTarget: prismacoverage.buildTarget,
            instrumentCwd: prismacoverage.instrumentCwd,
            sceneKey,
            scene,
            builds: builds as any,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      } catch (e) {
        // 允许失败，如果记录已存在（id 冲突）或其他错误，忽略即可
      }
    }

    return {
      success: true,
      prismacoverage,
    };
  }
}

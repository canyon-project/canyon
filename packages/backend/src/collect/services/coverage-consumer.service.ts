import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { addMaps, ensureNumMap } from '../../helpers/coverage-merge.util';
import { PrismaService } from '../../prisma/prisma.service';
import { PrismaSqliteService } from '../../prisma/prisma-sqlite.service';

interface CoverageQueuePayload {
  coverage: Record<
    string,
    {
      s?: Record<string, number>;
      f?: Record<string, number>;
      b?: Record<string, unknown>;
      inputSourceMap?: number;
    }
  >;
  coverageID: string;
  versionID: string;
  instrumentCwd: string;
}

interface GroupAgg {
  coverageID: string;
  versionID: string;
  filePath: string;
  s: Record<string, number>;
  f: Record<string, number>;
  b: Record<string, unknown>;
  latestTs: Date;
  inputSourceMap: number;
}

@Injectable()
export class CoverageConsumerService implements OnModuleInit {
  private readonly logger = new Logger(CoverageConsumerService.name);
  private isRunning = false;
  private readonly queryLimit = Number(
    process.env.COVERAGE_CONSUMER_QUERY_LIMIT || 100,
  );
  private readonly lockTimeout = Number(
    process.env.COVERAGE_LOCK_TIMEOUT_MS || 300000, // 5分钟
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaSqlite: PrismaSqliteService,
  ) {}

  async onModuleInit() {
    void this.startConsumptionLoop();
    this.logger.log('Coverage consumer started with infinite loop');
  }

  private async startConsumptionLoop() {
    while (true) {
      if (this.isRunning) {
        await this.sleep(1000);
        continue;
      }

      this.isRunning = true;
      try {
        // 从 SQLite 队列中获取待处理的任务
        const queueItem = await this.prismaSqlite.coverageQueue.findFirst({
          where: {
            status: 'PENDING',
          },
          orderBy: {
            createdAt: 'asc',
          },
        });
        console.log('queueItem', queueItem);
        if (!queueItem) {
          this.isRunning = false;
          await this.sleep(10000);
          continue;
        }

        // 处理任务
        await this.processQueueItem(queueItem.id);
      } catch (e) {
        this.logger.error('Coverage consumption loop error', e as any);
        await this.sleep(5000);
      } finally {
        this.isRunning = false;
      }
    }
  }

  private async processQueueItem(queueId: number) {
    // 标记为处理中
    await this.prismaSqlite.coverageQueue.update({
      where: { id: queueId },
      data: { status: 'PROCESSING' },
    });

    try {
      const queueItem = await this.prismaSqlite.coverageQueue.findUnique({
        where: { id: queueId },
      });

      if (!queueItem) {
        return;
      }

      const payload = queueItem.payload as unknown as CoverageQueuePayload;
      const { coverage, coverageID, versionID } = payload;

      // 尝试获取分布式锁
      const lockAcquired = await this.acquireLock(coverageID);
      if (!lockAcquired) {
        // 如果获取锁失败，重新标记为 PENDING，稍后重试
        await this.prismaSqlite.coverageQueue.update({
          where: { id: queueId },
          data: { status: 'PENDING' },
        });
        await this.sleep(1000);
        return;
      }

      try {
        // 处理覆盖率数据合并
        await this.mergeCoverageData(coverage, coverageID, versionID);

        // 标记为完成
        await this.prismaSqlite.coverageQueue.update({
          where: { id: queueId },
          data: { status: 'DONE' },
        });
      } finally {
        // 释放锁
        await this.releaseLock(coverageID);
      }
    } catch (e) {
      this.logger.error(`Failed to process queue item ${queueId}`, e as any);
      // 标记为失败
      await this.prismaSqlite.coverageQueue.update({
        where: { id: queueId },
        data: {
          status: 'FAILED',
          retry: { increment: 1 },
        },
      });
    }
  }

  private async acquireLock(coverageID: string): Promise<boolean> {
    try {
      // 清理过期的锁
      await this.prisma.$executeRawUnsafe(`
        DELETE FROM canyon_final_coverage_lock
        WHERE locked_at < NOW() - INTERVAL '${this.lockTimeout} milliseconds'
      `);

      // 尝试插入锁（如果已存在则失败）
      // 注意：coverageID 是通过 generateObjectSignature 生成的哈希值，不会有 SQL 注入风险
      const lockedBy = process.env.HOSTNAME || 'unknown';
      await this.prisma.$executeRawUnsafe(`
        INSERT INTO canyon_final_coverage_lock (coverage_id, locked_at, locked_by)
        VALUES ('${coverageID}', NOW(), '${lockedBy}')
      `);
      return true;
    } catch (e) {
      // 锁已存在，获取失败
      return false;
    }
  }

  private async releaseLock(coverageID: string): Promise<void> {
    try {
      // 注意：coverageID 是通过 generateObjectSignature 生成的哈希值，不会有 SQL 注入风险
      await this.prisma.$executeRawUnsafe(`
        DELETE FROM canyon_final_coverage_lock
        WHERE coverage_id = '${coverageID}'
      `);
    } catch (e) {
      // 忽略删除错误
    }
  }

  private async mergeCoverageData(
    coverage: CoverageQueuePayload['coverage'],
    coverageID: string,
    versionID: string,
  ): Promise<void> {
    // 将覆盖率数据转换为实体列表
    const hitEntities = Object.entries(coverage).map(([filePath, entry]) => {
      const s: Record<string, number> = entry?.s || {};
      return {
        coverageID,
        versionID,
        filePath,
        s,
        f: entry?.f || {},
        b: entry?.b || {},
        inputSourceMap: entry?.inputSourceMap ? 1 : 0,
        ts: new Date(),
      };
    });

    // 按 coverageID 和 filePath 分组合并
    const groupMap = new Map<string, GroupAgg>();

    for (const entity of hitEntities) {
      const key = `${entity.coverageID}|${entity.filePath}`;
      const sMap = ensureNumMap(entity.s);
      const fMap = ensureNumMap(entity.f);
      const ts = entity.ts instanceof Date ? entity.ts : new Date(entity.ts);

      const cur = groupMap.get(key);
      if (!cur) {
        groupMap.set(key, {
          coverageID: entity.coverageID,
          versionID: entity.versionID,
          filePath: entity.filePath,
          s: sMap,
          f: fMap,
          b: entity.b || {},
          latestTs: ts,
          inputSourceMap: entity.inputSourceMap || 0,
        });
      } else {
        cur.s = addMaps(cur.s, sMap);
        cur.f = addMaps(cur.f, fMap);
        if (ts > cur.latestTs) cur.latestTs = ts;
      }
    }

    // 写入/更新 CoverHitAggNext 表
    for (const agg of groupMap.values()) {
      const existing = await this.prisma.coverHitAggNext.findUnique({
        where: {
          coverageID_versionID_filePath: {
            coverageID: agg.coverageID,
            versionID: agg.versionID,
            filePath: agg.filePath,
          },
        },
      });

      if (!existing) {
        await this.prisma.coverHitAggNext.create({
          data: {
            coverageID: agg.coverageID,
            versionID: agg.versionID,
            filePath: agg.filePath,
            s: agg.s,
            f: agg.f,
            b: agg.b as any,
            inputSourceMap: agg.inputSourceMap,
            ts: agg.latestTs,
          },
        });
      } else {
        const existS = ensureNumMap(existing.s);
        const existF = ensureNumMap(existing.f);
        const mergedS = addMaps(existS, agg.s);
        const mergedF = addMaps(existF, agg.f);
        const mergedLatestTs =
          (existing.ts instanceof Date ? existing.ts : new Date(existing.ts)) >
          agg.latestTs
            ? existing.ts instanceof Date
              ? existing.ts
              : new Date(existing.ts)
            : agg.latestTs;

        await this.prisma.coverHitAggNext.update({
          where: {
            coverageID_versionID_filePath: {
              coverageID: agg.coverageID,
              versionID: agg.versionID,
              filePath: agg.filePath,
            },
          },
          data: {
            s: mergedS,
            f: mergedF,
            b: {} as any,
            inputSourceMap: agg.inputSourceMap,
            ts: mergedLatestTs,
          },
        });
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

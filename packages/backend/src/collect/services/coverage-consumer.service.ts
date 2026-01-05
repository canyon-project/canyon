import { Injectable, OnModuleInit } from '@nestjs/common';
import { addMaps, ensureNumMap } from '../../helpers/coverage-merge.util';
import { PrismaService } from '../../prisma/prisma.service';
import { PrismaSqliteService } from '../../prisma/prisma-sqlite.service';
import { CoverageLockService } from './coverage-lock.service';

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
  buildHash: string;
  sceneKey: string;
}

@Injectable()
export class CoverageConsumerService implements OnModuleInit {
  private isRunning = false;
  private readonly queryLimit = Number(
    process.env.COVERAGE_CONSUMER_QUERY_LIMIT || 100,
  );
  private readonly currentPid = process.pid;

  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaSqlite: PrismaSqliteService,
    private readonly coverageLockService: CoverageLockService,
  ) {}

  async onModuleInit() {
    void this.startConsumptionLoop();
  }

  private async startConsumptionLoop() {
    while (true) {
      if (this.isRunning) {
        await this.sleep(1000);
        continue;
      }

      this.isRunning = true;
      try {
        // 先本地聚合相同 coverageID 的数据
        await this.mergeLocalCoverageData();

        // 从 SQLite 队列中获取待处理的任务（只处理当前进程的或未分配的任务）
        const queueItems = await this.prismaSqlite.$queryRawUnsafe<
          Array<{
            id: number;
            payload: string;
            status: string;
            pid: number | null;
            createdAt: Date;
          }>
        >(`
          SELECT * FROM coverage_queue
          WHERE status = 'PENDING'
            AND (pid IS NULL OR pid = ${this.currentPid})
          ORDER BY createdAt ASC
          LIMIT 1
        `);

        const queueItem = queueItems[0];
        if (!queueItem) {
          this.isRunning = false;
          await this.sleep(10000);
          continue;
        }

        // 处理任务
        await this.processQueueItem(queueItem.id);
      } catch (e) {
        await this.sleep(5000);
      } finally {
        this.isRunning = false;
      }
    }
  }

  private async processQueueItem(queueId: number) {
    // 标记为处理中并设置当前进程 ID
    const updateResult = await this.prismaSqlite.$executeRawUnsafe(`
      UPDATE coverage_queue
      SET status = 'PROCESSING', pid = ${this.currentPid}
      WHERE id = ${queueId} AND status = 'PENDING'
    `);

    // 如果更新行数为 0，说明任务已经被其他进程处理了
    if (updateResult === 0) {
      return;
    }

    try {
      const queueItem = await this.prismaSqlite.coverageQueue.findUnique({
        where: { id: queueId },
      });

      if (!queueItem) {
        return;
      }

      // payload 是 JSON string，需要解析
      const payload: CoverageQueuePayload = JSON.parse(
        queueItem.payload as string,
      );

      const { coverage, buildHash, sceneKey } = payload;

      // coverageID = buildHash + '|' + sceneKey
      const coverageID = `${buildHash}|${sceneKey}`;

      // 尝试获取分布式锁
      const lockAcquired =
        await this.coverageLockService.acquireLock(coverageID);
      if (!lockAcquired) {
        // 如果获取锁失败，更新 createdAt 时间，将其放到后面参加循环
        await this.prismaSqlite.$executeRawUnsafe(`
          UPDATE coverage_queue
          SET status = 'PENDING', createdAt = CURRENT_TIMESTAMP
          WHERE id = ${queueId}
        `);
        await this.sleep(1000);
        return;
      }

      try {
        // 消费逻辑：插入或更新 CoverageHit 表
        await this.mergeCoverageData(coverage, buildHash, sceneKey);

        // 成功消费后删除队列记录，避免 SQLite 数据无限膨胀
        await this.prismaSqlite.coverageQueue.delete({
          where: { id: queueId },
        });
      } finally {
        // 释放锁
        await this.coverageLockService.releaseLock(coverageID);
      }
    } catch (e) {
      // 标记为失败
      await this.prismaSqlite.coverageQueue.update({
        where: { id: queueId },
        data: {
          status: 'FAILED',
        },
      });
    }
  }

  /**
   * 本地合并相同 coverageID 的待处理数据
   * 在每次循环前调用，提升处理效率
   */
  private async mergeLocalCoverageData(): Promise<void> {
    try {
      // 获取当前进程的待处理任务或未分配的任务，按 coverageID 分组
      // 支持全表合并，不限制数量
      const pendingItems = await this.prismaSqlite.$queryRawUnsafe<
        Array<{
          id: number;
          payload: string;
          status: string;
          pid: number | null;
          createdAt: Date;
        }>
      >(`
        SELECT * FROM coverage_queue
        WHERE status = 'PENDING'
          AND (pid IS NULL OR pid = ${this.currentPid})
        ORDER BY createdAt ASC
      `);

      if (pendingItems.length <= 1) {
        return; // 没有或只有一个任务，无需合并
      }

      // 按 coverageID 分组
      const coverageGroups = new Map<
        string,
        Array<{ id: number; payload: CoverageQueuePayload }>
      >();

      for (const item of pendingItems) {
        // payload 是 JSON string，需要解析
        let payload: CoverageQueuePayload;
        try {
          payload = JSON.parse(item.payload) as CoverageQueuePayload;
        } catch (e) {
          continue;
        }

        // 验证 payload 格式
        if (!payload || typeof payload !== 'object') {
          continue;
        }

        const { buildHash, sceneKey, coverage } = payload;

        // 验证必要字段
        if (
          !buildHash ||
          !sceneKey ||
          !coverage ||
          typeof coverage !== 'object'
        ) {
          continue;
        }

        const coverageID = `${buildHash}|${sceneKey}`;

        if (!coverageGroups.has(coverageID)) {
          coverageGroups.set(coverageID, []);
        }
        coverageGroups.get(coverageID)!.push({
          id: item.id,
          payload,
        });
      }

      // 对每个 coverageID 组进行合并
      for (const [coverageID, items] of coverageGroups.entries()) {
        if (items.length <= 1) {
          continue; // 只有一个任务，无需合并
        }

        // 合并所有覆盖率数据
        const mergedCoverage: CoverageQueuePayload['coverage'] = {};
        let buildHash = '';
        let sceneKey = '';

        for (const item of items) {
          const payload = item.payload;

          // 验证 payload
          if (
            !payload ||
            !payload.buildHash ||
            !payload.sceneKey ||
            !payload.coverage
          ) {
            continue;
          }

          buildHash = payload.buildHash;
          sceneKey = payload.sceneKey;

          // 验证 coverage 是对象
          if (
            typeof payload.coverage !== 'object' ||
            payload.coverage === null
          ) {
            continue;
          }

          // 合并覆盖率数据
          for (const [filePath, entry] of Object.entries(payload.coverage)) {
            if (!mergedCoverage[filePath]) {
              mergedCoverage[filePath] = {
                s: {},
                f: {},
                b: {},
              };
            }

            const merged = mergedCoverage[filePath];
            const sMap = ensureNumMap(entry?.s || {});
            const fMap = ensureNumMap(entry?.f || {});

            // 合并 s 和 f
            merged.s = addMaps(ensureNumMap(merged.s), sMap);
            merged.f = addMaps(ensureNumMap(merged.f), fMap);

            // 保留 inputSourceMap（如果有）
            if (entry?.inputSourceMap) {
              merged.inputSourceMap = entry.inputSourceMap;
            }
          }
        }

        // 如果合并后的数据为空，跳过这个组
        if (
          Object.keys(mergedCoverage).length === 0 ||
          !buildHash ||
          !sceneKey
        ) {
          continue;
        }

        // 创建合并后的 payload
        const mergedPayload: CoverageQueuePayload = {
          coverage: mergedCoverage,
          buildHash,
          sceneKey,
        };

        // 删除旧的任务，创建新的合并任务
        const idsToDelete = items.map((item) => item.id);
        const firstItemId = idsToDelete[0];
        const otherItemIds = idsToDelete.slice(1);

        // 更新第一个任务为合并后的数据，并设置为当前进程
        await this.prismaSqlite.coverageQueue.update({
          where: { id: firstItemId },
          data: {
            payload: JSON.stringify(mergedPayload),
            pid: this.currentPid,
          },
        });

        // 删除其他任务
        if (otherItemIds.length > 0) {
          await this.prismaSqlite.$executeRawUnsafe(`
            DELETE FROM coverage_queue
            WHERE id IN (${otherItemIds.map((id) => id.toString()).join(',')})
          `);
        }
      }
    } catch (e) {
      // 不抛出错误，继续处理
    }
  }

  /**
   * 合并覆盖率数据并写入/更新 CoverageHit 表
   * 使用 upsert 进行乐观更新
   */
  private async mergeCoverageData(
    coverage: CoverageQueuePayload['coverage'],
    buildHash: string,
    sceneKey: string,
  ): Promise<void> {
    let createdCount = 0;
    let updatedCount = 0;

    for (const [filePath, entry] of Object.entries(coverage)) {
      try {
        const id = `${buildHash}|${sceneKey}|${filePath}`;
        const s = ensureNumMap(entry?.s || {});
        const f = ensureNumMap(entry?.f || {});

        // 使用 upsert 进行乐观更新
        // 先查询现有记录以合并数据
        const existing = await this.prisma.coverageHit.findUnique({
          where: { id },
          select: { s: true, f: true },
        });

        let mergedS = s;
        let mergedF = f;

        if (existing) {
          // 如果存在，合并 s 和 f 字段
          const existS = ensureNumMap(existing.s);
          const existF = ensureNumMap(existing.f);
          mergedS = addMaps(existS, s);
          mergedF = addMaps(existF, f);
        }

        // 使用 upsert 创建或更新
        await this.prisma.coverageHit.upsert({
          where: { id },
          create: {
            id,
            buildHash,
            sceneKey,
            rawFilePath: filePath,
            s: mergedS,
            f: mergedF,
            b: (entry?.b || {}) as any,
            inputSourceMap: entry?.inputSourceMap ? 1 : null,
            createdAt: new Date(),
          },
          update: {
            s: mergedS,
            f: mergedF,
          },
        });

        if (existing) {
          updatedCount++;
        } else {
          createdCount++;
        }
      } catch (e) {
        // 继续处理其他文件，不中断整个流程
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

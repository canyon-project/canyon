import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { addMaps, ensureNumMap } from '../../helpers/coverage-merge.util';
import { logger } from '../../logger';
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
  private readonly logger = new Logger(CoverageConsumerService.name);
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
    logger({
      type: 'info',
      title: 'CoverageConsumer',
      message: 'Coverage consumer started with infinite loop',
      addInfo: { pid: this.currentPid },
    });
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
        logger({
          type: 'debug',
          title: 'CoverageConsumer',
          message: 'Starting consumption loop iteration',
          addInfo: { pid: this.currentPid },
        });

        // 先本地聚合相同 coverageID 的数据
        await this.mergeLocalCoverageData();

        // 从 SQLite 队列中获取待处理的任务（只处理当前进程的或未分配的任务）
        const queueItems = await this.prismaSqlite.$queryRawUnsafe<
          Array<{
            id: number;
            payload: any;
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
          logger({
            type: 'debug',
            title: 'CoverageConsumer',
            message: 'No pending queue items found, waiting...',
            addInfo: { pid: this.currentPid },
          });
          this.isRunning = false;
          await this.sleep(10000);
          continue;
        }

        logger({
          type: 'info',
          title: 'CoverageConsumer',
          message: 'Found queue item to process',
          addInfo: {
            queueId: queueItem.id,
            pid: this.currentPid,
            queuePid: queueItem.pid,
            createdAt: queueItem.createdAt,
          },
        });

        // 处理任务
        await this.processQueueItem(queueItem.id);
      } catch (e) {
        logger({
          type: 'error',
          title: 'CoverageConsumer',
          message: 'Coverage consumption loop error',
          addInfo: {
            pid: this.currentPid,
            error: e instanceof Error ? e.message : String(e),
          },
        });
        this.logger.error('Coverage consumption loop error', e as any);
        await this.sleep(5000);
      } finally {
        this.isRunning = false;
      }
    }
  }

  private async processQueueItem(queueId: number) {
    logger({
      type: 'info',
      title: 'CoverageConsumer',
      message: 'Processing queue item',
      addInfo: { queueId, pid: this.currentPid },
    });

    // 标记为处理中并设置当前进程 ID
    const updateResult = await this.prismaSqlite.$executeRawUnsafe(`
      UPDATE coverage_queue
      SET status = 'PROCESSING', pid = ${this.currentPid}
      WHERE id = ${queueId} AND status = 'PENDING'
    `);

    // 如果更新行数为 0，说明任务已经被其他进程处理了
    if (updateResult === 0) {
      logger({
        type: 'warn',
        title: 'CoverageConsumer',
        message: 'Queue item already processed by another process',
        addInfo: { queueId, pid: this.currentPid },
      });
      return;
    }

    try {
      const queueItem = await this.prismaSqlite.coverageQueue.findUnique({
        where: { id: queueId },
      });

      if (!queueItem) {
        logger({
          type: 'warn',
          title: 'CoverageConsumer',
          message: 'Queue item not found',
          addInfo: { queueId, pid: this.currentPid },
        });
        return;
      }

      const payload = queueItem.payload as unknown as CoverageQueuePayload;
      const { coverage, buildHash, sceneKey } = payload;

      // coverageID = buildHash + '|' + sceneKey
      const coverageID = `${buildHash}|${sceneKey}`;

      logger({
        type: 'info',
        title: 'CoverageConsumer',
        message: 'Attempting to acquire lock',
        addInfo: {
          queueId,
          coverageID,
          buildHash,
          sceneKey,
          pid: this.currentPid,
          fileCount: Object.keys(coverage).length,
        },
      });

      // 尝试获取分布式锁
      const lockAcquired =
        await this.coverageLockService.acquireLock(coverageID);
      if (!lockAcquired) {
        logger({
          type: 'warn',
          title: 'CoverageConsumer',
          message: 'Failed to acquire lock, deferring task',
          addInfo: {
            queueId,
            coverageID,
            pid: this.currentPid,
          },
        });
        // 如果获取锁失败，更新 createdAt 时间，将其放到后面参加循环
        await this.prismaSqlite.$executeRawUnsafe(`
          UPDATE coverage_queue
          SET status = 'PENDING', createdAt = CURRENT_TIMESTAMP
          WHERE id = ${queueId}
        `);
        await this.sleep(1000);
        return;
      }

      logger({
        type: 'info',
        title: 'CoverageConsumer',
        message: 'Lock acquired successfully',
        addInfo: { queueId, coverageID, pid: this.currentPid },
      });

      try {
        logger({
          type: 'info',
          title: 'CoverageConsumer',
          message: 'Processing coverage data',
          addInfo: {
            queueId,
            coverageID,
            buildHash,
            sceneKey,
            pid: this.currentPid,
            fileCount: Object.keys(coverage).length,
          },
        });

        // 消费逻辑：插入或更新 CoverageHit 表
        await this.mergeCoverageData(coverage, buildHash, sceneKey);

        // 标记为完成
        await this.prismaSqlite.coverageQueue.update({
          where: { id: queueId },
          data: { status: 'DONE' },
        });

        logger({
          type: 'info',
          title: 'CoverageConsumer',
          message: 'Queue item processed successfully',
          addInfo: { queueId, coverageID, pid: this.currentPid },
        });
      } finally {
        // 释放锁
        logger({
          type: 'debug',
          title: 'CoverageConsumer',
          message: 'Releasing lock',
          addInfo: { queueId, coverageID, pid: this.currentPid },
        });
        await this.coverageLockService.releaseLock(coverageID);
      }
    } catch (e) {
      logger({
        type: 'error',
        title: 'CoverageConsumer',
        message: 'Failed to process queue item',
        addInfo: {
          queueId,
          pid: this.currentPid,
          error: e instanceof Error ? e.message : String(e),
        },
      });
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

  /**
   * 本地合并相同 coverageID 的待处理数据
   * 在每次循环前调用，提升处理效率
   */
  private async mergeLocalCoverageData(): Promise<void> {
    try {
      logger({
        type: 'debug',
        title: 'CoverageConsumer',
        message: 'Starting local coverage data merge',
        addInfo: { pid: this.currentPid, queryLimit: this.queryLimit },
      });

      // 获取当前进程的待处理任务或未分配的任务，按 coverageID 分组
      const pendingItems = await this.prismaSqlite.$queryRawUnsafe<
        Array<{
          id: number;
          payload: any;
          status: string;
          pid: number | null;
          createdAt: Date;
        }>
      >(`
        SELECT * FROM coverage_queue
        WHERE status = 'PENDING'
          AND (pid IS NULL OR pid = ${this.currentPid})
        ORDER BY createdAt ASC
        LIMIT ${this.queryLimit}
      `);

      if (pendingItems.length <= 1) {
        logger({
          type: 'debug',
          title: 'CoverageConsumer',
          message: 'No items to merge locally',
          addInfo: { pid: this.currentPid, itemCount: pendingItems.length },
        });
        return; // 没有或只有一个任务，无需合并
      }

      logger({
        type: 'info',
        title: 'CoverageConsumer',
        message: 'Found items for local merge',
        addInfo: {
          pid: this.currentPid,
          itemCount: pendingItems.length,
        },
      });

      // 按 coverageID 分组
      const coverageGroups = new Map<
        string,
        Array<{ id: number; payload: CoverageQueuePayload }>
      >();

      for (const item of pendingItems) {
        const payload = item.payload as unknown as CoverageQueuePayload;
        const { buildHash, sceneKey } = payload;
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

        logger({
          type: 'info',
          title: 'CoverageConsumer',
          message: 'Merging local coverage items',
          addInfo: {
            coverageID,
            itemCount: items.length,
            pid: this.currentPid,
          },
        });

        // 合并所有覆盖率数据
        const mergedCoverage: CoverageQueuePayload['coverage'] = {};
        let buildHash = '';
        let sceneKey = '';

        for (const item of items) {
          buildHash = item.payload.buildHash;
          sceneKey = item.payload.sceneKey;

          // 合并覆盖率数据
          for (const [filePath, entry] of Object.entries(
            item.payload.coverage,
          )) {
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
        await (this.prismaSqlite.coverageQueue.update as any)({
          where: { id: firstItemId },
          data: {
            payload: mergedPayload,
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

        logger({
          type: 'info',
          title: 'CoverageConsumer',
          message: 'Local merge completed',
          addInfo: {
            coverageID,
            mergedCount: items.length,
            keptId: firstItemId,
            deletedIds: otherItemIds,
            pid: this.currentPid,
          },
        });
      }

      logger({
        type: 'info',
        title: 'CoverageConsumer',
        message: 'Local coverage data merge finished',
        addInfo: {
          pid: this.currentPid,
          groupCount: coverageGroups.size,
        },
      });
    } catch (e) {
      logger({
        type: 'error',
        title: 'CoverageConsumer',
        message: 'Failed to merge local coverage data',
        addInfo: {
          pid: this.currentPid,
          error: e instanceof Error ? e.message : String(e),
        },
      });
      this.logger.error('Failed to merge local coverage data', e as any);
      // 不抛出错误，继续处理
    }
  }

  /**
   * 合并覆盖率数据并写入/更新 CoverageHit 表
   */
  private async mergeCoverageData(
    coverage: CoverageQueuePayload['coverage'],
    buildHash: string,
    sceneKey: string,
  ): Promise<void> {
    const fileCount = Object.keys(coverage).length;
    logger({
      type: 'debug',
      title: 'CoverageConsumer',
      message: 'Merging coverage data',
      addInfo: {
        buildHash,
        sceneKey,
        fileCount,
        pid: this.currentPid,
      },
    });

    let createdCount = 0;
    let updatedCount = 0;

    for (const [filePath, entry] of Object.entries(coverage)) {
      try {
        const id = `${buildHash}|${sceneKey}|${filePath}`;
        const s = ensureNumMap(entry?.s || {});
        const f = ensureNumMap(entry?.f || {});

        // 查找现有记录
        const existing = await this.prisma.coverageHit.findUnique({
          where: { id },
        });

        if (!existing) {
          // 不存在则创建
          try {
            await this.prisma.coverageHit.create({
              data: {
                id,
                buildHash,
                sceneKey,
                rawFilePath: filePath,
                s,
                f,
                b: (entry?.b || {}) as any,
                inputSourceMap: entry?.inputSourceMap ? 1 : null,
                createdAt: new Date(),
              },
            });
            createdCount++;
          } catch (createError: any) {
            // 如果创建失败（可能是唯一约束冲突），说明另一个进程已经创建了，重新查询并更新
            if (createError?.code === 'P2002') {
              const retryExisting = await this.prisma.coverageHit.findUnique({
                where: { id },
              });
              if (retryExisting) {
                const existS = ensureNumMap(retryExisting.s);
                const existF = ensureNumMap(retryExisting.f);
                const mergedS = addMaps(existS, s);
                const mergedF = addMaps(existF, f);

                await this.prisma.coverageHit.update({
                  where: { id },
                  data: {
                    s: mergedS,
                    f: mergedF,
                  },
                });
                updatedCount++;
              }
            } else {
              throw createError;
            }
          }
        } else {
          // 存在则更新，合并 s 和 f 字段
          const existS = ensureNumMap(existing.s);
          const existF = ensureNumMap(existing.f);
          const mergedS = addMaps(existS, s);
          const mergedF = addMaps(existF, f);

          await this.prisma.coverageHit.update({
            where: { id },
            data: {
              s: mergedS,
              f: mergedF,
            },
          });
          updatedCount++;
        }
      } catch (e) {
        logger({
          type: 'error',
          title: 'CoverageConsumer',
          message: 'Failed to upsert coverage data',
          addInfo: {
            buildHash,
            sceneKey,
            filePath,
            pid: this.currentPid,
            error: e instanceof Error ? e.message : String(e),
          },
        });
        // 继续处理其他文件，不中断整个流程
      }
    }

    logger({
      type: 'debug',
      title: 'CoverageConsumer',
      message: 'Coverage data merge statistics',
      addInfo: {
        buildHash,
        sceneKey,
        totalFiles: fileCount,
        created: createdCount,
        updated: updatedCount,
        pid: this.currentPid,
      },
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

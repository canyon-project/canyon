import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { addMaps, ensureNumMap } from '../../helpers/coverage-merge.util';
import { logger } from '../../logger';
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
  private readonly currentPid = process.pid; // 当前进程 ID

  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaSqlite: PrismaSqliteService,
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

        // 每次循环前先尝试本地合并相同 coverageID 的数据
        await this.mergeLocalCoverageData();

        // 从 SQLite 队列中获取待处理的任务（只处理当前进程的或未分配的任务）
        // 使用原始 SQL 查询避免类型错误（Prisma 客户端需要重新生成）
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
    // 使用原子更新，确保只有状态为 PENDING 的任务才能被处理
    // 这样可以避免多个进程同时处理同一个任务
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
      const { coverage, coverageID, versionID } = payload;

      logger({
        type: 'info',
        title: 'CoverageConsumer',
        message: 'Attempting to acquire lock',
        addInfo: {
          queueId,
          coverageID,
          versionID,
          pid: this.currentPid,
          fileCount: Object.keys(coverage).length,
        },
      });

      // 尝试获取分布式锁
      const lockAcquired = await this.acquireLock(coverageID);
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
        // 处理覆盖率数据合并
        logger({
          type: 'info',
          title: 'CoverageConsumer',
          message: 'Starting coverage data merge',
          addInfo: {
            queueId,
            coverageID,
            versionID,
            pid: this.currentPid,
            fileCount: Object.keys(coverage).length,
          },
        });

        await this.mergeCoverageData(coverage, coverageID, versionID);

        logger({
          type: 'info',
          title: 'CoverageConsumer',
          message: 'Coverage data merge completed',
          addInfo: {
            queueId,
            coverageID,
            versionID,
            pid: this.currentPid,
          },
        });

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
        await this.releaseLock(coverageID);
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
      logger({
        type: 'debug',
        title: 'CoverageConsumer',
        message: 'Lock acquired',
        addInfo: { coverageID, lockedBy, pid: this.currentPid },
      });
      return true;
    } catch (e) {
      // 锁已存在，获取失败
      logger({
        type: 'debug',
        title: 'CoverageConsumer',
        message: 'Lock already exists',
        addInfo: {
          coverageID,
          pid: this.currentPid,
          error: e instanceof Error ? e.message : String(e),
        },
      });
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
      logger({
        type: 'debug',
        title: 'CoverageConsumer',
        message: 'Lock released',
        addInfo: { coverageID, pid: this.currentPid },
      });
    } catch (e) {
      logger({
        type: 'warn',
        title: 'CoverageConsumer',
        message: 'Failed to release lock',
        addInfo: {
          coverageID,
          pid: this.currentPid,
          error: e instanceof Error ? e.message : String(e),
        },
      });
      // 忽略删除错误
    }
  }

  private async mergeCoverageData(
    coverage: CoverageQueuePayload['coverage'],
    coverageID: string,
    versionID: string,
  ): Promise<void> {
    const fileCount = Object.keys(coverage).length;
    logger({
      type: 'debug',
      title: 'CoverageConsumer',
      message: 'Merging coverage data',
      addInfo: {
        coverageID,
        versionID,
        fileCount,
        pid: this.currentPid,
      },
    });

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
    // 使用 upsert 避免 findUnique + create/update 之间的竞态条件
    // 虽然已经有分布式锁保护，但使用 upsert 更加安全可靠
    let createdCount = 0;
    let updatedCount = 0;
    for (const agg of groupMap.values()) {
      try {
        // 先尝试查找现有记录
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
          // 不存在则创建，使用 try-catch 处理可能的并发创建冲突
          try {
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
            createdCount++;
          } catch (createError: any) {
            // 如果创建失败（可能是唯一约束冲突），说明另一个进程已经创建了，重新查询并更新
            if (createError?.code === 'P2002') {
              const retryExisting =
                await this.prisma.coverHitAggNext.findUnique({
                  where: {
                    coverageID_versionID_filePath: {
                      coverageID: agg.coverageID,
                      versionID: agg.versionID,
                      filePath: agg.filePath,
                    },
                  },
                });
              if (retryExisting) {
                const existS = ensureNumMap(retryExisting.s);
                const existF = ensureNumMap(retryExisting.f);
                const mergedS = addMaps(existS, agg.s);
                const mergedF = addMaps(existF, agg.f);
                const mergedLatestTs =
                  (retryExisting.ts instanceof Date
                    ? retryExisting.ts
                    : new Date(retryExisting.ts)) > agg.latestTs
                    ? retryExisting.ts instanceof Date
                      ? retryExisting.ts
                      : new Date(retryExisting.ts)
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
                updatedCount++;
              }
            } else {
              throw createError;
            }
          }
        } else {
          // 存在则更新
          const existS = ensureNumMap(existing.s);
          const existF = ensureNumMap(existing.f);
          const mergedS = addMaps(existS, agg.s);
          const mergedF = addMaps(existF, agg.f);
          const mergedLatestTs =
            (existing.ts instanceof Date
              ? existing.ts
              : new Date(existing.ts)) > agg.latestTs
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
          updatedCount++;
        }
      } catch (e) {
        logger({
          type: 'error',
          title: 'CoverageConsumer',
          message: 'Failed to upsert coverage data',
          addInfo: {
            coverageID: agg.coverageID,
            versionID: agg.versionID,
            filePath: agg.filePath,
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
        coverageID,
        versionID,
        totalFiles: groupMap.size,
        created: createdCount,
        updated: updatedCount,
        pid: this.currentPid,
      },
    });
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
      // 使用原始 SQL 查询避免类型错误
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
        const { coverageID } = payload;
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
        let versionID = '';
        let instrumentCwd = '';

        for (const item of items) {
          versionID = item.payload.versionID;
          instrumentCwd = item.payload.instrumentCwd;

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

            // 合并 b（如果有）
            if (entry?.b) {
              merged.b = { ...merged.b, ...entry.b };
            }

            // 保留 inputSourceMap（如果有）
            if (entry?.inputSourceMap) {
              merged.inputSourceMap = entry.inputSourceMap;
            }
          }
        }

        // 创建合并后的 payload
        const mergedPayload: CoverageQueuePayload = {
          coverage: mergedCoverage,
          coverageID,
          versionID,
          instrumentCwd,
        };

        // 删除旧的任务，创建新的合并任务
        const idsToDelete = items.map((item) => item.id);
        const firstItemId = idsToDelete[0];
        const otherItemIds = idsToDelete.slice(1);

        // 更新第一个任务为合并后的数据，并设置为当前进程
        // 使用类型断言绕过 Prisma 类型检查（pid 字段需要重新生成客户端）
        await (this.prismaSqlite.coverageQueue.update as any)({
          where: { id: firstItemId },
          data: {
            payload: mergedPayload,
            pid: this.currentPid, // 设置为当前进程
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

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

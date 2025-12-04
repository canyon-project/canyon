import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { remapCoverageByOld } from '../collect/helpers/canyon-data';
import { decodeCompressedObject } from '../collect/helpers/transform';
import { addMaps, ensureNumMap } from '../helpers/coverage-merge.util';
import { PrismaService } from '../prisma/prisma.service';
import {
  GroupAgg,
  TaskCoverageAggResult,
  TaskCoverageDelResult,
} from './task.types';

@Injectable()
export class TaskService implements OnModuleInit {
  private readonly logger = new Logger(TaskService.name);
  private isRunning = false;
  private isDelRunning = false;
  private readonly pollIntervalMs = Number(
    process.env.TASK_COVERAGE_AGG_POLL_MS || 3000,
  );
  private readonly delPollIntervalMs = Number(
    process.env.TASK_COVERAGE_DEL_POLL_MS || 30000,
  );
  // 4G 内存机器保险限制：每次查询最多处理 2000 条记录
  private readonly queryLimit = Number(
    process.env.TASK_COVERAGE_QUERY_LIMIT || 2000,
  );
  // 4G 内存机器保险限制：每次删除最多 5000 条记录
  private readonly deleteLimit = Number(
    process.env.TASK_COVERAGE_DELETE_LIMIT || 5000,
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  async onModuleInit() {
    // 只有当 START_DISTRIBUTED_TASK 环境变量存在时才启动任务
    if (process.env['START_DISTRIBUTED_TASK']) {
      const pollInterval = setInterval(() => {
        void this.pollOnce();
      }, this.pollIntervalMs);
      this.schedulerRegistry.addInterval('coverageAggregation', pollInterval);
      this.logger.log(
        `Task coverage aggregator polling every ${this.pollIntervalMs}ms`,
      );

      const delInterval = setInterval(() => {
        void this.pollDelOnce();
      }, this.delPollIntervalMs);
      this.schedulerRegistry.addInterval('coverageDeletion', delInterval);
      this.logger.log(
        `Task coverage delete polling every ${this.delPollIntervalMs}ms`,
      );
    }
  }

  private async pollOnce() {
    if (this.isRunning) return;
    this.isRunning = true;
    try {
      // 取最早的 coverageID 进行处理
      const candidate = await this.prisma.coverHit.groupBy({
        by: ['coverageID'],
        where: { aggregated: false },
        _min: { ts: true },
        orderBy: { _min: { ts: 'asc' } },
        take: 1,
      });

      if (candidate.length === 0) return;

      const coverageID = candidate[0].coverageID;
      const r = await this.taskCoverageAgg(coverageID);
      if (r.processed > 0) {
        this.logger.log(
          `Aggregated coverage=${coverageID} processed=${r.processed}, groups=${r.groups}`,
        );
      }
    } catch (e) {
      this.logger.error('pollOnce error', e as any);
    } finally {
      this.isRunning = false;
    }
  }

  private async pollDelOnce() {
    if (this.isDelRunning) return;
    this.isDelRunning = true;
    try {
      // 先查询要删除的记录 ID，限制数量以控制内存使用
      const toDelete = await this.prisma.coverHit.findMany({
        where: { aggregated: true },
        select: { id: true },
        take: this.deleteLimit,
      });

      if (toDelete.length === 0) return;

      const { count } = await this.prisma.coverHit.deleteMany({
        where: {
          id: {
            in: toDelete.map((r) => r.id),
          },
        },
      });
      if (count > 0) {
        this.logger.log(`Deleted aggregated hits count=${count}`);
      }
    } catch (e) {
      this.logger.error('pollDelOnce error', e as any);
    } finally {
      this.isDelRunning = false;
    }
  }

  async taskCoverageAgg(
    targetCoverageID?: string,
  ): Promise<TaskCoverageAggResult> {
    // 仅处理一个 coverageID 的"最早一批"（按 versionID 分组，取该 coverageID 下最早的 versionID）
    // 避免一次性全量拉取

    // 选择一个待处理的 coverageID（按最早 ts），或使用传入的 coverageID
    let coverageID = targetCoverageID;
    if (!coverageID) {
      const covGroup = await this.prisma.coverHit.groupBy({
        by: ['coverageID'],
        where: { aggregated: false },
        _min: { ts: true },
        orderBy: { _min: { ts: 'asc' } },
        take: 1,
      });
      if (covGroup.length === 0) {
        return { processed: 0, groups: 0 };
      }
      coverageID = covGroup[0].coverageID;
    }

    // 拉取该 coverageID 的未聚合记录（按时间顺序），限制数量以控制内存使用
    const list = await this.prisma.coverHit.findMany({
      where: { aggregated: false, coverageID },
      orderBy: { ts: 'asc' },
      take: this.queryLimit,
    });
    if (list.length === 0) {
      return { processed: 0, groups: 0 };
    }

    // 先分组累加，后统一写库
    const groupMap = new Map<string, GroupAgg>();
    const idsToMark: string[] = [];

    // coverageID 相同的情况下，versionID 也一定相同，从第一条记录获取
    const versionID = list[0].versionID;

    for (const rec of list) {
      const key = `${rec.coverageID}|${rec.filePath}`;
      const sMap = ensureNumMap(rec.s);
      const fMap = ensureNumMap(rec.f);
      const ts = rec.ts instanceof Date ? rec.ts : new Date(rec.ts);

      const cur = groupMap.get(key);
      if (!cur) {
        groupMap.set(key, {
          coverageID: rec.coverageID,
          versionID: rec.versionID,
          filePath: rec.filePath,
          s: sMap,
          f: fMap,
          b: {},
          latestTs: ts,
          inputSourceMap: rec.inputSourceMap || 0,
        });
      } else {
        cur.s = addMaps(cur.s, sMap);
        cur.f = addMaps(cur.f, fMap);
        // branch 不需要合并，保持为空对象
        if (ts > cur.latestTs) cur.latestTs = ts;
      }

      idsToMark.push(rec.id);
    }

    // 写入/更新聚合表（按组一次）
    for (let agg of groupMap.values()) {
      if (agg.inputSourceMap === 1) {
        const incwd = await this.prisma.coverage
          .findFirst({
            where: {
              versionID: agg.versionID,
            },
          })
          .then((h) => h?.instrumentCwd || '');

        const coverageMapRelation =
          await this.prisma.coverageMapRelation.findFirst({
            where: {
              versionID: agg.versionID,
              restoreFullFilePath: `${incwd}/${agg.filePath}`, // TODO review
            },
          });

        if (
          coverageMapRelation &&
          coverageMapRelation.coverageMapHashID &&
          coverageMapRelation.sourceMapHashID
        ) {
          const coverMap = await this.prisma.coverMap.findFirst({
            where: {
              hash: {
                startsWith: coverageMapRelation.coverageMapHashID,
              },
            },
          });

          const coverageSourceMap = await this.prisma.coverageSourceMap
            .findFirst({
              where: {
                hash: coverageMapRelation.sourceMapHashID,
              },
            })
            .then((r) => decodeCompressedObject(r?.sourceMap));

          const aggBox = await remapCoverageByOld({
            [coverageMapRelation.restoreFullFilePath]: {
              path: coverageMapRelation.restoreFullFilePath,
              // @ts-expect-error
              ...coverMap?.restore,
              branchMap: {}, //暂时还不支持branchMap
              inputSourceMap: coverageSourceMap,
              b: agg.b,
              f: agg.f,
              s: agg.s,
            },
          })
            .then((r) => {
              const o: any = Object.values(r)[0];
              return {
                ...agg,
                b: o.b,
                f: o.f,
                s: o.s,
                filePath: o.path.replace(incwd + '/', ''),
              };
            })
            .catch(() => {
              return false;
            });

          if (aggBox) {
            // @ts-expect-error
            agg = aggBox;
          }
        }
      }

      const existing = await this.prisma.coverHitAgg.findFirst({
        where: {
          coverageID: agg.coverageID,
          filePath: agg.filePath,
        },
      });

      if (!existing) {
        await this.prisma.coverHitAgg.create({
          data: {
            coverageID: agg.coverageID,
            versionID: agg.versionID,
            filePath: agg.filePath,
            s: agg.s,
            f: agg.f,
            b: agg.b,
            latestTs: agg.latestTs,
          },
        });
      } else {
        const existS = ensureNumMap(existing.s as unknown);
        const existF = ensureNumMap(existing.f as unknown);
        const mergedS = addMaps(existS, agg.s);
        const mergedF = addMaps(existF, agg.f);
        const mergedLatestTs =
          (existing.latestTs as Date) > agg.latestTs
            ? (existing.latestTs as Date)
            : agg.latestTs;

        await this.prisma.coverHitAgg.update({
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
            b: {},
            latestTs: mergedLatestTs,
          },
        });
      }
    }

    // 一把标记已聚合
    if (idsToMark.length > 0) {
      await this.prisma.coverHit.updateMany({
        where: {
          id: {
            in: idsToMark,
          },
        },
        data: {
          aggregated: true,
        },
      });
    }

    return { processed: list.length, groups: groupMap.size };
  }
}

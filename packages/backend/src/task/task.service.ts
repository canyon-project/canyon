import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { remapCoverageByOld } from '../collect/helpers/canyon-data';
import { decodeCompressedObject } from '../collect/helpers/transform';
import { addMaps, ensureNumMap } from '../helpers/coverage-merge.util';
import { PrismaService } from '../prisma/prisma.service';
import { GroupAgg, TaskCoverageAggResult } from './task.types';

@Injectable()
export class TaskService implements OnModuleInit {
  private readonly logger = new Logger(TaskService.name);
  private isRunning = false;
  // 4G 内存机器保险限制：每次查询最多处理 2000 条记录
  private readonly queryLimit = Number(
    process.env.TASK_COVERAGE_QUERY_LIMIT || 2000,
  );

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    // 只有当 START_DISTRIBUTED_TASK 环境变量存在时才启动任务
    if (process.env['START_DISTRIBUTED_TASK']) {
      // 启动无限循环的覆盖率聚合任务
      void this.startCoverageAggregationLoop();
      this.logger.log('Task coverage aggregator started with infinite loop');
    }
  }

  private async startCoverageAggregationLoop() {
    while (true) {
      if (this.isRunning) {
        await this.sleep(1000); // 如果正在运行，等待1秒后重试
        continue;
      }

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

        if (candidate.length === 0) {
          // 没有数据时休眠10秒
          this.isRunning = false;
          await this.sleep(10000);
          continue;
        }

        const coverageID = candidate[0].coverageID;
        const r = await this.taskCoverageAgg(coverageID);
        if (r.processed > 0) {
          this.logger.log(
            `Aggregated coverage=${coverageID} processed=${r.processed}, groups=${r.groups}`,
          );
        }
      } catch (e) {
        this.logger.error('Coverage aggregation loop error', e as any);
        // 出错时也休眠一下，避免错误循环
        await this.sleep(5000);
      } finally {
        this.isRunning = false;
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
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

      // 标记完成后立即删除这些记录
      await this.prisma.coverHit.deleteMany({
        where: {
          id: {
            in: idsToMark,
          },
        },
      });
    }

    return { processed: list.length, groups: groupMap.size };
  }
}

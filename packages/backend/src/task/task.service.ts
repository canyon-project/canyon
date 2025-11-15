import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { remapCoverageByOld } from '../collect/helpers/canyon-data';
import { decodeCompressedObject } from '../collect/helpers/transform';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TaskService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TaskService.name);
  private pollTimer: NodeJS.Timeout | null = null;
  private isRunning = false;
  private readonly pollIntervalMs = Number(
    process.env.TASK_COVERAGE_AGG_POLL_MS || 3000,
  );

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    // 启动自轮询任务
    this.startPolling();
  }

  async onModuleDestroy() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private startPolling() {
    if (this.pollTimer) return;
    this.pollTimer = setInterval(() => {
      void this.pollOnce();
    }, this.pollIntervalMs);
    this.logger.log(
      `Task coverage aggregator polling every ${this.pollIntervalMs}ms`,
    );
  }

  private async pollOnce() {
    if (this.isRunning) return;
    this.isRunning = true;
    try {
      // 取若干个最早的 coverageID，逐个尝试加锁，谁锁住就处理谁
      const candidates = await this.prisma.coverHit.groupBy({
        by: ['coverageID'],
        where: { aggregated: false },
        _min: { ts: true },
        orderBy: { _min: { ts: 'asc' } },
        take: 5,
      });
      for (const c of candidates) {
        const coverageID = c.coverageID;
        const locked = await this.tryAcquireCoverageLock(coverageID);
        if (!locked) continue;
        try {
          const r = await this.taskCoverageAgg(coverageID);
          if (r.processed > 0) {
            this.logger.log(
              `Aggregated coverage=${coverageID} processed=${r.processed}, groups=${r.groups}`,
            );
          }
        } finally {
          await this.releaseCoverageLock(coverageID);
        }
        // 每轮只处理一个 coverageID，留给其它实例处理其余 coverageID
        break;
      }
    } catch (e) {
      this.logger.error('pollOnce error', e as any);
    } finally {
      this.isRunning = false;
    }
  }

  private async tryAcquireCoverageLock(coverageID: string): Promise<boolean> {
    const rows = (await this.prisma.$queryRaw<
      Array<{ locked: boolean }>
    >`SELECT pg_try_advisory_lock(hashtext(${coverageID})::bigint) AS locked`) as Array<{
      locked: boolean;
    }>;
    return rows?.[0]?.locked === true;
  }

  private async releaseCoverageLock(coverageID: string): Promise<void> {
    await this.prisma
      .$queryRaw`SELECT pg_advisory_unlock(hashtext(${coverageID})::bigint) AS unlocked`;
  }

  async taskCoverageAgg(targetCoverageID?: string) {
    // 仅处理一个 coverageID 的“最早一批”（按 versionID 分组，取该 coverageID 下最早的 versionID）
    // 避免一次性全量拉取

    type NumMap = Record<string, number>;
    function ensureNumMap(value: unknown): NumMap {
      if (!value || typeof value !== 'object') return {};
      const src = value as Record<string, unknown>;
      const out: NumMap = {};
      for (const k of Object.keys(src)) {
        const v = src[k] as any;
        // 支持 number 或可转 number 的字符串
        const n = typeof v === 'number' ? v : Number(v);
        if (!Number.isNaN(n)) out[k] = (out[k] || 0) + n;
      }
      return out;
    }
    function addMaps(a: NumMap, b: NumMap): NumMap {
      const res: NumMap = { ...a };
      for (const k of Object.keys(b)) {
        res[k] = (res[k] || 0) + b[k];
      }
      return res;
    }

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

    // 在该 coverageID 内，选择最早的一批 versionID
    const verGroup = await this.prisma.coverHit.groupBy({
      by: ['versionID'],
      where: { aggregated: false, coverageID },
      _min: { ts: true },
      orderBy: { _min: { ts: 'asc' } },
      take: 1,
    });
    if (verGroup.length === 0) {
      return { processed: 0, groups: 0 };
    }
    const versionID = verGroup[0].versionID;

    // 拉取该 coverageID + versionID 的未聚合记录（按时间顺序）
    const list = await this.prisma.coverHit.findMany({
      where: { aggregated: false, coverageID, versionID },
      orderBy: { ts: 'asc' },
    });

    // 先分组累加，后统一写库
    interface GroupAgg {
      coverageID: string;
      versionID: string;
      filePath: string;
      s: Record<string, number>;
      f: Record<string, number>;
      b: Record<string, number>;
      latestTs: Date;
      inputSourceMap: number;
    }
    const groupMap = new Map<string, GroupAgg>();
    const idsToMark: string[] = [];

    for (const rec of list) {
      const key = `${rec.coverageID}|${rec.versionID}|${rec.filePath}`;
      const sMap = ensureNumMap(rec.s);
      const fMap = ensureNumMap(rec.f);
      const bMap = ensureNumMap(rec.b);
      const ts = rec.ts instanceof Date ? rec.ts : new Date(rec.ts);
      const cur = groupMap.get(key);
      if (!cur) {
        groupMap.set(key, {
          coverageID: rec.coverageID,
          versionID: rec.versionID,
          filePath: rec.filePath,
          s: sMap,
          f: fMap,
          b: bMap,
          latestTs: ts,
          inputSourceMap: rec.inputSourceMap || 0,
        });
      } else {
        cur.s = addMaps(cur.s, sMap);
        cur.f = addMaps(cur.f, fMap);
        cur.b = addMaps(cur.b, bMap);
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
        if (coverageMapRelation) {
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

          agg = await remapCoverageByOld({
            [coverageMapRelation.restoreFullFilePath]: {
              path: coverageMapRelation.restoreFullFilePath,
              // @ts-expect-errorr
              ...coverMap?.restore,
              branchMap: {}, //暂时还不支持branchMap
              inputSourceMap: coverageSourceMap,
              b: agg.b,
              f: agg.f,
              s: agg.s,
            },
          }).then((r) => {
            const o: any = Object.values(r)[0];
            return {
              ...agg,
              b: o.b,
              f: o.f,
              s: o.s,
              filePath: o.path.replace(incwd + '/', ''),
            };
          });
        }
      }

      const existing = await this.prisma.coverHitAgg.findFirst({
        where: {
          coverageID: agg.coverageID,
          versionID: agg.versionID,
          filePath: agg.filePath,
        },
      });
      if (!existing) {
        const entity = await this.prisma.coverHitAgg.create({
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
        const existB = ensureNumMap(existing.b as unknown);
        existing.s = addMaps(existS, agg.s);
        existing.f = addMaps(existF, agg.f);
        existing.b = addMaps(existB, agg.b);
        existing.latestTs =
          (existing.latestTs as Date) > agg.latestTs
            ? (existing.latestTs as Date)
            : agg.latestTs;
        const r = await this.prisma.coverHitAgg.update({
          where: {
            coverageID_versionID_filePath: {
              coverageID: agg.coverageID,
              versionID: agg.versionID,
              filePath: agg.filePath,
            },
          },
          data: {
            s: existing.s,
            f: existing.f,
            b: existing.b,
            latestTs: existing.latestTs,
          },
        });
        // this.orm.em.persist(existing);
      }
    }
    // await this.orm.em.flush();

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

  async taskCoverageDel() {
    return this.prisma.coverHit.deleteMany({
      where: {
        aggregated: true,
      },
    });
  }
}

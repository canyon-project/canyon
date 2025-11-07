import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// 暂时采用外部定时器触发

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  async taskCoverageAgg() {
    // 参考 packages/backend/sql/cover_refresh_hit_agg.sql 实现：
    // 简化为顺序处理，不做批量与事务：
    // - 读取所有 aggregated=false 的 canyon_hit 记录
    // - 逐条累加到 canyon_hit_agg（若存在则累加 s/f/b，latest_ts 取最大，否则插入）
    // - 每条处理完即标记 aggregated=true

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

    const list = await this.prisma.coverHit.findMany(
      {
        where: { aggregated: false },
        orderBy: { ts: 'asc' },
      },
      // { orderBy: { ts: 'asc' } },
    );

    // 先分组累加，后统一写库
    interface GroupAgg {
      coverageID: string;
      versionID: string;
      filePath: string;
      s: Record<string, number>;
      f: Record<string, number>;
      b: Record<string, number>;
      latestTs: Date;
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
    for (const agg of groupMap.values()) {
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
        // console.log(entity)
        // this.orm.em.persist(entity);
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
        console.log(r);
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

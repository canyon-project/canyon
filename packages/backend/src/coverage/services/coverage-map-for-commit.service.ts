import { Injectable } from '@nestjs/common';
import { generateObjectSignature } from '../../collect/helpers/generateObjectSignature';
// import { extractIstanbulData } from '../../helpers/coverage-map-util';
import {
  addMaps,
  ensureNumMap,
  NumMap,
} from '../../helpers/coverage-merge.util';
import { testExclude } from '../../helpers/test-exclude';
import { PrismaService } from '../../prisma/prisma.service';
import { extractIstanbulData } from '../helpers/coverage-map-util';
// import { NumMap } from '../../task/task.types';
import { CoverageMapStoreService } from './coverage.map-store.service';

@Injectable()
export class CoverageMapForCommitService {
  constructor(
    private readonly coverageMapStoreService: CoverageMapStoreService,
    private readonly prisma: PrismaService,
  ) {}
  async invoke({
    provider,
    repoID,
    sha,
    buildTarget,
    reportProvider,
    reportID,
    filePath,
  }) {
    // 第一步：生成coverageID，核心7个字段，确保顺序
    // const coverageID = generateObjectSignature({
    //   provider,
    //   repoID,
    //   sha,
    //   buildTarget,
    //   reportProvider,
    //   reportID,
    // });

    const coverageList = await this.prisma.coverage.findMany({
      where: {
        provider,
        repoID,
        sha,
        buildTarget,
      },
    });

    if (coverageList.length === 0) {
      return {};
    }

    const coverage = coverageList[0];

    // 有了init map方便很多，直接查关系表就行
    const coverageMapRelationList =
      await this.prisma.coverageMapRelation.findMany({
        where: {
          buildHash: coverage.buildHash,
        },
      });

    const pathToHash = new Map<string, string>();
    for (const r of coverageMapRelationList) {
      const key =
        r.sourceMapHash === '' ? r.fullFilePath : r.restoreFullFilePath;

      if (!pathToHash.has(key))
        pathToHash.set(key, `${r.coverageMapHash}|${r.fileContentHash}`);
    }

    const hashList = coverageMapRelationList.map(
      ({ coverageMapHash, fileContentHash }) =>
        `${coverageMapHash}|${fileContentHash}`,
    );
    const hashToMap =
      await this.coverageMapStoreService.fetchCoverageMapsFromClickHouse(
        hashList,
      );

    // 查hit
    const rows = await this.prisma.coverageHit.findMany({
      where: {
        buildHash: coverage.buildHash,
      },
    });

    // 按 rawFilePath 分组并合并多个 coverageID 的数据
    const mergedRows = new Map<
      string,
      {
        rawFilePath: string;
        s: NumMap;
        f: NumMap;
        latestTs: Date;
      }
    >();

    for (const r of rows || []) {
      const rawFilePath = r.rawFilePath;
      const sMap = ensureNumMap(r.s);
      const fMap = ensureNumMap(r.f);
      const ts =
        r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt);

      const existing = mergedRows.get(rawFilePath);
      if (!existing) {
        mergedRows.set(rawFilePath, {
          rawFilePath,
          s: sMap,
          f: fMap,
          latestTs: ts,
        });
      } else {
        existing.s = addMaps(existing.s, sMap);
        existing.f = addMaps(existing.f, fMap);
        if (ts > existing.latestTs) {
          existing.latestTs = ts;
        }
      }
    }

    // 9) 组装最终结果：合并命中、补齐 0 值、转换分支为数组
    const result: Record<string, unknown> = {};
    for (const mergedRow of mergedRows.values()) {
      // 未处理的路径
      const path = mergedRow.rawFilePath;
      const structure = hashToMap.find((i) => {
        return i.hash === pathToHash.get(path);
      });

      if (structure) {
        result[path] = {
          path,
          ...extractIstanbulData(structure),
          s: mergedRow.s,
          f: mergedRow.f,
          contentHash: structure.hash.split('|')[1],
        };
      }
    }
    return result;
  }
}

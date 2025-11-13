import { Injectable } from '@nestjs/common';
import { generateObjectSignature } from '../../collect/helpers/generateObjectSignature';
import { extractIstanbulData } from '../../helpers/coverage-map-util';
import { testExclude } from '../../helpers/test-exclude';
import { PrismaService } from '../../prisma/prisma.service';
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
    // compareTarget,
    onlyChanged, // TODO 默认为true，显式传false才返回全部
  }) {
    // 第一步：生成coverageID，核心7个字段，确保顺序
    const coverageID = generateObjectSignature({
      provider,
      repoID,
      sha,
      buildTarget,
      reportProvider,
      reportID,
    });
    // 生成versionID
    const versionID = generateObjectSignature({
      provider,
      repoID,
      sha,
      buildTarget,
    });

    const qb = {};

    if (filePath) {
      qb['filePath'] = filePath;
    }
    if (versionID) {
      qb['versionID'] = versionID;
    }

    const relationsAll = await this.prisma.coverageMapRelation.findMany({
      where: qb,
    });
    const pathToHash = new Map<string, string>();
    for (const r of relationsAll) {
      if (!pathToHash.has(r.filePath))
        pathToHash.set(r.filePath, `${r.coverageMapHashID}|${r.contentHashID}`);
    }

    const hashList = relationsAll.map(
      (x) => `${x.coverageMapHashID}|${x.contentHashID}`,
    );
    const hashToMap =
      await this.coverageMapStoreService.fetchCoverageMapsFromClickHouse(
        hashList,
      );

    // 查hit

    // 确实都查出来的，但是没合并
    const rows = await this.prisma.coverHitAgg.findMany({
      where: {
        versionID: versionID,
      },
    });

    // 9) 组装最终结果：合并命中、补齐 0 值、转换分支为数组
    const result: Record<string, unknown> = {};
    for (const r of rows || []) {
      const path = r.filePath;
      const structure = hashToMap.find((i) => {
        return i.hash === pathToHash.get(path);
      });

      if (structure) {
        result[path] = {
          path,
          ...extractIstanbulData(structure),
          s: r.s,
          contentHash: structure.hash.split('|')[1],
        };
      }
    }

    // include/exclude 过滤
    const repo = await this.prisma.repo.findFirst({
      where: {
        id: repoID,
      },
    });
    const filtered = testExclude(result, repo?.config);
    return result;
  }
}

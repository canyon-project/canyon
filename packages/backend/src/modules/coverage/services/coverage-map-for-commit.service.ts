import { EntityRepository, QueryOrder } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { CoverageEntity } from '../../../entities/coverage.entity';
import { CoverageMapRelationEntity } from '../../../entities/coverage-map-relation.entity';
import { RepoEntity } from '../../../entities/repo.entity';
import { encodeID } from '../../../helpers/coverageID';
import { transformFlatBranchHitsToArrays } from '../../../helpers/utils';
import { ChService } from '../../ch/ch.service';
import { SystemConfigService } from '../../system-config/system-config.service';
import { tupleToMap } from '../coverage.utils';
import { CoverageMapStoreService } from './coverage.map-store.service';

@Injectable()
export class CoverageMapForCommitService {
  constructor(
    private readonly ch: ChService,
    private readonly syscfg: SystemConfigService,
    private readonly coverageMapStoreService: CoverageMapStoreService,
    @InjectRepository(CoverageEntity)
    private readonly covRepo: EntityRepository<CoverageEntity>,
    @InjectRepository(RepoEntity)
    private readonly repo: EntityRepository<RepoEntity>,
    @InjectRepository(CoverageMapRelationEntity)
    private readonly relRepo: EntityRepository<CoverageMapRelationEntity>,
  ) {}
  async invoke({
    provider,
    repoID,
    sha,
    buildProvider,
    buildID,
    reportProvider,
    reportID,
    filePath,
    compareTarget,
    onlyChanged,
  }) {
    const versionID = encodeID({
      provider,
      repoID,
      sha,
      buildProvider,
      buildID,
    });

    const coverageID = encodeID({
      provider,
      repoID,
      sha,
      buildProvider,
      buildID,
      reportProvider,
      reportID,
    });

    const hitQueryWhere = reportID ? 'coverage_id' : 'version_id';
    const hitQueryID = reportID ? coverageID : versionID;

    // 3) 在 ClickHouse 中聚合命中数据（按文件路径归并）
    const hitQuery = `
      SELECT
        file_path as filePath,
        sumMapMerge(s) as s,
        sumMapMerge(f) as f,
        sumMapMerge(b) as b
      FROM coverage_hit_agg
      WHERE ${hitQueryWhere} = '${hitQueryID}'
      ${filePath ? ` AND endsWith(file_path, '${filePath.replace(/'/g, "''")}')` : ''}
      GROUP BY file_path
    `;
    const ch = this.ch.getClient();
    const hitRes = await ch.query({ query: hitQuery, format: 'JSONEachRow' });
    const rows: Array<{
      filePath: string;
      s: unknown;
      f: unknown;
      b: unknown;
    }> = await hitRes.json();

    const qb = {};

    if (filePath) {
      qb['filePath'] = filePath;
    }
    if (versionID) {
      qb['versionID'] = versionID;
    }

    const relationsAll = await this.relRepo.find(qb);

    const pathToHash = new Map<string, string>();
    for (const r of relationsAll) {
      if (!pathToHash.has(r.filePath))
        pathToHash.set(r.filePath, r.coverageMapHashID);
    }

    const hashList = relationsAll.map((x) => x.coverageMapHashID);
    const hashToMap =
      await this.coverageMapStoreService.fetchCoverageMapsFromClickHouse(
        hashList,
      );

    // 9) 组装最终结果：合并命中、补齐 0 值、转换分支为数组
    const result: Record<string, unknown> = {};
    for (const r of rows || []) {
      const path = r.filePath;
      const hash = pathToHash.get(r.filePath);
      const structure = hash ? hashToMap.get(hash) : undefined;

      if (structure) {
        const sMap = tupleToMap(r.s);
        const fMap = tupleToMap(r.f);
        const bFlat = tupleToMap(r.b);

        // 补齐 ClickHouse 未返回的 0 值（以结构 map 为基准）
        if (structure?.statementMap) {
          for (const id of Object.keys(structure.statementMap)) {
            if (sMap[id] === undefined) sMap[id] = 0;
          }
        }
        if (structure?.fnMap) {
          for (const id of Object.keys(structure.fnMap)) {
            if (fMap[id] === undefined) fMap[id] = 0;
          }
        }
        // b 转换为 Istanbul 期望的数组形式
        const bArr = transformFlatBranchHitsToArrays(
          bFlat,
          structure?.branchMap as
            | Record<string, { locations?: unknown[] }>
            | undefined,
        );
        // const change = changedSet ? changedSet.has(path) : false;
        // if (onlyChanged && !change) continue;
        result[path] = {
          path,
          ...(structure as Record<string, unknown>),
          s: sMap,
          f: fMap,
          b: bArr,
          // change: false,
        };
      }
    }

    return result;
  }
}

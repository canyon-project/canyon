import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CoverageEntity } from '../../../entities/coverage.entity';
import { CoverageMapRelationEntity } from '../../../entities/coverage-map-relation.entity';
import { RepoEntity } from '../../../entities/repo.entity';
import { testExclude } from '../../../helpers/test-exclude';
import { transformFlatBranchHitsToArrays } from '../../../helpers/utils';
import { ChService } from '../../ch/ch.service';
import { SystemConfigService } from '../../system-config/system-config.service';
import {
  mergeFunctionHitsByBlock,
  mergeStatementHitsByBlock,
  trimInstrumentCwd,
  tupleToMap,
} from '../coverage.utils';
import { CoverageMapStoreService } from './coverage.map-store.service';

@Injectable()
export class CoverageMapForPullService {
  constructor(
    private readonly ch: ChService,
    private readonly syscfg: SystemConfigService,
    private readonly mapStore: CoverageMapStoreService,
    @InjectRepository(CoverageEntity)
    private readonly covRepo: EntityRepository<CoverageEntity>,
    @InjectRepository(RepoEntity)
    private readonly repo: EntityRepository<RepoEntity>,
    @InjectRepository(CoverageMapRelationEntity)
    private readonly relRepo: EntityRepository<CoverageMapRelationEntity>,
  ) {}

  private async fetchGitLabFile(
    baseUrl: string,
    projectId: string,
    sha: string,
    filePath: string,
    headers: Record<string, string>,
  ): Promise<string> {
    const url = `${baseUrl}/api/v4/projects/${projectId}/repository/files/${encodeURIComponent(
      filePath,
    )}/raw`;
    try {
      const resp = await axios.get(url, {
        headers,
        params: { ref: sha },
        responseType: 'text',
      });
      if (resp.status >= 200 && resp.status < 300)
        return String(resp.data || '');
    } catch {
      // ignore
    }
    return '';
  }

  async invoke({
    provider,
    repoID,
    pullNumber,
    filePath,
    mode,
  }: {
    provider: string;
    repoID: string;
    pullNumber: string;
    filePath?: string;
    mode?: string; // 'fileMerge' | 'blockMerge'
  }) {
    // 仅支持 gitlab
    if (provider !== 'gitlab') return {};

    const baseUrl =
      (await this.syscfg?.get('system_config.gitlab_base_url')) ||
      process.env.GITLAB_BASE_URL;
    const token =
      (await this.syscfg?.get('git_provider[0].private_token')) ||
      process.env.GITLAB_TOKEN;
    if (!baseUrl || !token) return {};

    const projectId = encodeURIComponent(repoID);
    const headers = { 'PRIVATE-TOKEN': token } as Record<string, string>;

    // MR 基本信息，获取 headSha
    const mrResp = await axios.get(
      `${baseUrl}/api/v4/projects/${projectId}/merge_requests/${pullNumber}`,
      { headers },
    );
    if (mrResp.status < 200 || mrResp.status >= 300) return {};
    const mr: { diff_refs?: { head_sha?: string }; sha?: string } = mrResp.data;
    const headSha: string | undefined = mr?.diff_refs?.head_sha || mr?.sha;
    if (!headSha) return {};

    // MR 提交列表
    const commitsResp = await axios.get(
      `${baseUrl}/api/v4/projects/${projectId}/merge_requests/${pullNumber}/commits`,
      { headers },
    );
    if (commitsResp.status < 200 || commitsResp.status >= 300) return {};
    const commits: Array<{ id: string }> = commitsResp.data as Array<{
      id: string;
    }>;
    if (!Array.isArray(commits) || commits.length === 0) return {};

    console.log(commits, 'commits');

    // 覆盖记录查询，选择 baseline（headSha 优先）
    const shas = commits.map((c) => c.id);
    const covWhere: {
      provider: string;
      repoID: string;
      sha: { $in: string[] };
    } = {
      provider,
      repoID,
      sha: { $in: shas },
    };
    const allCov = await this.covRepo.find(covWhere, {
      fields: ['id', 'sha', 'instrumentCwd', 'versionID'],
    });
    if (!allCov.length) return {};

    const covByID = new Map(allCov.map((c) => [c.id, c] as const));
    const baseSet = new Set<string>();
    for (const c of allCov) if (c.sha === headSha) baseSet.add(c.id);
    if (baseSet.size === 0) baseSet.add(allCov[0].id);
    const baselineCovID = [...baseSet][0];

    // 关系映射（可按 filePath 过滤，默认剔除 dist）
    const covIds = allCov.map((c) => c.id);
    const versionIds = Array.from(new Set(allCov.map((c) => c.versionID)));
    const relWhere: {
      versionID: { $in: string[] };
      filePath?: string | RegExp;
    } = {
      versionID: { $in: versionIds },
      filePath: /^(?!dist).*/,
    };
    if (filePath) relWhere.filePath = filePath;
    const relationsAll = await this.relRepo.find(relWhere, {
      fields: ['versionID', 'coverageMapHashID', 'fullFilePath', 'filePath'],
    });

    // ClickHouse 命中聚合（带 coverageID 用于分组）
    const idsList = covIds.map((id) => `'${id.replace(/'/g, "''")}'`).join(',');
    const hitQuery = `
      SELECT
        coverage_id as coverageID,
        full_file_path as fullFilePath,
        sumMapMerge(s) as s,
        sumMapMerge(f) as f,
        sumMapMerge(b) as b
      FROM coverage_hit_agg
      WHERE coverage_id IN (${idsList})
      ${filePath ? ` AND endsWith(full_file_path, '${filePath.replace(/'/g, "''")}')` : ''}
      GROUP BY coverage_id, full_file_path
    `;
    const ch = this.ch.getClient();
    const hitRes = await ch.query({ query: hitQuery, format: 'JSONEachRow' });
    const _hitRows: Array<{
      coverageID: string;
      fullFilePath: string;
      s: unknown;
      f: unknown;
      b: unknown;
    }> = await hitRes.json();
    const hitRows = _hitRows.filter((r) => !r.fullFilePath.includes('/dist/'));

    // 计算变更路径集合（非 fileMerge 才需要）
    const changesBySha = new Map<string, Set<string>>();
    if (mode && mode.toLowerCase() !== 'filemerge') {
      for (const c of commits) {
        if (c.id === headSha) continue;
        const cmpResp = await axios.get(
          `${baseUrl}/api/v4/projects/${projectId}/repository/compare`,
          { headers, params: { from: c.id, to: headSha } },
        );
        if (cmpResp.status < 200 || cmpResp.status >= 300) continue;
        const cmp = cmpResp.data as {
          diffs?: Array<{ old_path?: string; new_path?: string }>;
        };
        const s = new Set<string>();
        for (const d of cmp?.diffs || []) {
          if (d?.old_path) s.add(d.old_path);
          if (d?.new_path) s.add(d.new_path);
        }
        changesBySha.set(c.id, s);
      }
    }

    // 聚合容器
    const aggregated = new Map<
      string,
      {
        S: Record<string, number>;
        F: Record<string, number>;
        B: Record<string, number>;
      }
    >();
    const ensure = (path: string) => {
      if (!aggregated.has(path)) aggregated.set(path, { S: {}, F: {}, B: {} });
      return aggregated.get(path) ?? { S: {}, F: {}, B: {} };
    };
    const isBlockMerge = (mode || '').toLowerCase() === 'blockmerge';

    // 预加载结构：构建 (coverageID|relPath)->hash；拉取 hash->结构；为每个路径选一个结构（基于 baseline 优先）
    const covPathToHash = new Map<string, string>();
    const versionIdByCovId = new Map<string, string>(
      allCov.map((c) => [c.id, c.versionID] as const),
    );
    const baselineVersionID = versionIdByCovId.get(baselineCovID) as string;
    for (const r of relationsAll) {
      const rel = r.filePath;
      const key = `${r.versionID}|${rel}`;
      if (!covPathToHash.has(key)) covPathToHash.set(key, r.coverageMapHashID);
    }
    const allHashes = Array.from(
      new Set(relationsAll.map((r) => r.coverageMapHashID)),
    );
    const hashToMap =
      await this.mapStore.fetchCoverageMapsFromClickHouse(allHashes);
    const pathToStructure = new Map<string, unknown>();
    for (const r of relationsAll) {
      const rel = r.filePath;
      const struct = hashToMap.get(r.coverageMapHashID);
      if (!struct) continue;
      const existing = pathToStructure.get(rel);
      if (!existing || r.versionID === baselineVersionID)
        pathToStructure.set(rel, struct);
    }

    // 汇总命中：fileMerge 直接累加；blockMerge 对改动文件做块级增量
    for (const row of hitRows) {
      const cov = covByID.get(row.coverageID);
      if (!cov) continue;
      const isBaseline = baseSet.has(row.coverageID);
      const relPath = trimInstrumentCwd(row.fullFilePath, cov.instrumentCwd);
      let include = isBaseline;
      if (!isBaseline) {
        const changed = changesBySha.get(cov.sha);
        include = !changed?.has(relPath);
      }
      if (include || !isBlockMerge) {
        const agg = ensure(relPath);
        const s = tupleToMap(row.s);
        const f = tupleToMap(row.f);
        const b = tupleToMap(row.b);
        for (const [k, v] of Object.entries(s))
          agg.S[k] = (agg.S[k] || 0) + (v as number);
        for (const [k, v] of Object.entries(f))
          agg.F[k] = (agg.F[k] || 0) + (v as number);
        for (const [k, v] of Object.entries(b))
          agg.B[k] = (agg.B[k] || 0) + (v as number);
        continue;
      }

      // blockMerge 增量
      const baseKey = `${baselineVersionID}|${relPath}`;
      const otherVersionID = versionIdByCovId.get(row.coverageID) as string;
      const otherKey = `${otherVersionID}|${relPath}`;
      const baseHash = covPathToHash.get(baseKey);
      const otherHash = covPathToHash.get(otherKey);
      if (!baseHash || !otherHash) continue;
      const baseMap = hashToMap.get(baseHash) as
        | {
            statementMap?: Record<string, unknown>;
            fnMap?: Record<string, unknown>;
          }
        | undefined;
      const otherMap = hashToMap.get(otherHash) as
        | {
            statementMap?: Record<string, unknown>;
            fnMap?: Record<string, unknown>;
          }
        | undefined;
      if (!baseMap || !otherMap) continue;

      const baseContent = await this.fetchGitLabFile(
        baseUrl,
        projectId,
        headSha,
        relPath,
        headers,
      );
      const otherContent = await this.fetchGitLabFile(
        baseUrl,
        projectId,
        cov.sha,
        relPath,
        headers,
      );
      const stmtInc = mergeStatementHitsByBlock(
        baseContent,
        baseMap.statementMap as Record<
          string,
          {
            start?: { line?: number; column?: number };
            end?: { line?: number; column?: number };
          }
        >,
        otherContent,
        otherMap.statementMap as Record<
          string,
          {
            start?: { line?: number; column?: number };
            end?: { line?: number; column?: number };
          }
        >,
        tupleToMap(row.s),
      );
      const fnInc = mergeFunctionHitsByBlock(
        baseContent,
        baseMap.fnMap as Record<
          string,
          {
            loc?: {
              start?: { line?: number; column?: number };
              end?: { line?: number; column?: number };
            };
          }
        >,
        otherContent,
        otherMap.fnMap as Record<
          string,
          {
            loc?: {
              start?: { line?: number; column?: number };
              end?: { line?: number; column?: number };
            };
          }
        >,
        tupleToMap(row.f),
      );
      const agg = ensure(relPath);
      for (const [k, v] of Object.entries(stmtInc))
        agg.S[k] = (agg.S[k] || 0) + (v as number);
      for (const [k, v] of Object.entries(fnInc))
        agg.F[k] = (agg.F[k] || 0) + (v as number);
    }

    // 输出：修剪路径、补齐 0 值、转换分支数组
    const out: Record<string, unknown> = {};
    for (const [relPath, agg] of aggregated) {
      const struct = pathToStructure.get(relPath) as
        | {
            statementMap?: Record<string, unknown>;
            fnMap?: Record<string, unknown>;
            branchMap?: Record<string, { locations?: unknown[] }>;
          }
        | undefined;
      const sMap: Record<string, number> = { ...(agg.S || {}) };
      const fMap: Record<string, number> = { ...(agg.F || {}) };
      if (struct?.statementMap) {
        for (const id of Object.keys(struct.statementMap))
          if (sMap[id] === undefined) sMap[id] = 0;
      }
      if (struct?.fnMap) {
        for (const id of Object.keys(struct.fnMap))
          if (fMap[id] === undefined) fMap[id] = 0;
      }
      const bArr = transformFlatBranchHitsToArrays(agg.B, struct?.branchMap);
      out[relPath] = {
        path: relPath,
        ...(struct as Record<string, unknown>),
        s: sMap,
        f: fMap,
        b: bArr,
      };
    }

    // include/exclude 过滤
    const repo = await this.repo.findOne({ id: repoID });
    const filtered = testExclude(out, repo?.config);
    return filtered;
  }
}

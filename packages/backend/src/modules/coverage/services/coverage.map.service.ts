import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CoverageEntity } from '../../../entities/coverage.entity';
import { CoverageMapRelationEntity } from '../../../entities/coverage-map-relation.entity';
import { RepoEntity } from '../../../entities/repo.entity';
import { testExclude } from '../../../helpers/test-exclude';
import { ChService } from '../../ch/ch.service';
import { SystemConfigService } from '../../system-config/system-config.service';
import {
  mergeFunctionHitsByBlock,
  mergeStatementHitsByBlock,
  trimInstrumentCwd,
  tupleToMap,
} from '../coverage.utils';
import { CoverageGitService } from './coverage.git.service';
import { CoverageMapStoreService } from './coverage.map-store.service';

// 将扁平化的分支命中键解码为 (branchId, armIndex)，并按 Istanbul 期望的数组形式聚合
const MAX_BRANCH_LENGTH = 10000;
function decodeBranchKey(encodedKey: string | number): [number, number] {
  const k = Number(encodedKey || 0);
  const branchId = Math.floor(k / MAX_BRANCH_LENGTH);
  const armIndex = k % MAX_BRANCH_LENGTH;
  return [branchId, armIndex];
}

function transformFlatBranchHitsToArrays(
  flat: Record<string, number>,
  branchMapStructure?: Record<string, { locations?: unknown[] }>,
): Record<string, number[]> {
  const out: Record<string, number[]> = {};
  if (flat) {
    for (const [k, v] of Object.entries(flat)) {
      const [id, idx] = decodeBranchKey(k);
      const key = String(id);
      if (!out[key]) out[key] = [];
      out[key][idx] = Number(v || 0);
    }
  }
  // 根据结构补齐零值长度
  if (branchMapStructure) {
    for (const [id, info] of Object.entries(branchMapStructure)) {
      const key = String(id);
      const pathsLen = Array.isArray(info.locations)
        ? info.locations.length
        : 0;
      if (!out[key]) out[key] = new Array<number>(pathsLen).fill(0);
      else if (pathsLen > out[key].length) {
        out[key].length = pathsLen;
        for (let i = 0; i < pathsLen; i++)
          if (out[key][i] === undefined) out[key][i] = 0;
      } else {
        // 将未赋值的空位补 0
        for (let i = 0; i < out[key].length; i++)
          if (out[key][i] === undefined) out[key][i] = 0;
      }
    }
  } else {
    // 没有结构时，也将未赋值的空位补 0，以避免稀疏数组
    for (const key of Object.keys(out)) {
      for (let i = 0; i < out[key].length; i++)
        if (out[key][i] === undefined) out[key][i] = 0;
    }
  }
  return out;
}

@Injectable()
export class CoverageMapService {
  constructor(
    private readonly ch: ChService,
    private readonly syscfg: SystemConfigService,
    private readonly mapStore: CoverageMapStoreService,
    private readonly git: CoverageGitService,
    @InjectRepository(CoverageEntity)
    private readonly covRepo: EntityRepository<CoverageEntity>,
    @InjectRepository(RepoEntity)
    private readonly repo: EntityRepository<RepoEntity>,
    @InjectRepository(CoverageMapRelationEntity)
    private readonly relRepo: EntityRepository<CoverageMapRelationEntity>,
  ) {}

  async getMapForCommit({
    provider,
    repoID,
    sha,
    buildProvider,
    buildID,
    reportID,
    reportProvider,
    filePath,
  }: {
    provider: string;
    repoID: string;
    sha: string;
    buildProvider?: string;
    buildID?: string;
    reportProvider?: string;
    reportID?: string;
    filePath?: string;
  }) {
    // 1) 组装查询条件（按 provider/repoID/sha 以及可选的 buildProvider/buildID）
    const qb: {
      provider: string;
      repoID: string;
      sha: string;
      buildProvider?: string;
      buildID?: string;
    } = { provider, repoID, sha };
    if (buildProvider) qb.buildProvider = buildProvider;
    if (buildID) qb.buildID = buildID;
    // 2) 查询符合条件的覆盖记录（仅取用于后续处理的必要字段）
    const coverages = await this.covRepo.find(qb, {
      fields: ['id', 'instrumentCwd', 'reportProvider', 'reportID'],
    });
    if (!coverages.length) return {};

    // 3) 在 ClickHouse 中聚合命中数据（按文件路径归并）
    const coverageIDs = coverages.map((c) => c.id);
    const filterCoverages = coverages.filter((i) => {
      const reportProviderOff =
        !reportProvider || i.reportProvider === reportProvider;
      const reportIDOff = !reportID || i.reportID === reportID;
      return reportProviderOff && reportIDOff;
    });
    // 这里不需要 coverage_id 的group by，因为coverage_id已经通过report_id筛选了
    const idsList =
      filterCoverages.length > 0
        ? `${filterCoverages.map((h) => `'${h.id}'`).join(', ')}`
        : `''`;

    const hitQuery = `
      SELECT
        full_file_path as fullFilePath,
        sumMapMerge(s) as s,
        sumMapMerge(f) as f,
        sumMapMerge(b) as b
      FROM coverage_hit_agg
      WHERE coverage_id IN (${idsList})
      ${filePath ? ` AND endsWith(full_file_path, '${filePath.replace(/'/g, "''")}')` : ''}
      GROUP BY full_file_path
    `;
    const ch = this.ch.getClient();
    const hitRes = await ch.query({ query: hitQuery, format: 'JSONEachRow' });
    const rows: Array<{
      fullFilePath: string;
      s: unknown;
      f: unknown;
      b: unknown;
    }> = await hitRes.json();

    // 4) 获取 instrumentCwd，并查询关系表以获得文件路径到结构哈希的映射
    const instrumentCwd = coverages[0].instrumentCwd;
    const relWhere: {
      coverageID: { $in: string[] };
      filePath?: string | RegExp;
    } = {
      coverageID: { $in: coverageIDs },
      filePath: /^(?!dist).*/,
    };
    if (filePath) relWhere.filePath = filePath;

    const relationsAll = await this.relRepo.find(relWhere, {
      fields: ['coverageMapHashID', 'fullFilePath'],
    });
    const pathToHash = new Map<string, string>();
    for (const r of relationsAll) {
      if (!pathToHash.has(r.fullFilePath))
        pathToHash.set(r.fullFilePath, r.coverageMapHashID);
    }
    // 5) 批量拉取并缓存 hash -> 覆盖结构 的映射
    const allHashes = Array.from(new Set(Array.from(pathToHash.values())));
    const hashToMap =
      await this.mapStore.fetchCoverageMapsFromClickHouse(allHashes);

    // 6) 封装路径裁剪函数（将绝对路径裁剪为相对路径）
    const trimPath = (p: string) => trimInstrumentCwd(p, instrumentCwd);

    // 7) 组装最终结果：合并命中、补齐 0 值、转换分支为数组
    const result: Record<string, unknown> = {};
    for (const r of rows || []) {
      const path = trimPath(r.fullFilePath);
      const hash = pathToHash.get(r.fullFilePath);
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
        result[path] = {
          path,
          ...(structure as Record<string, unknown>),
          s: sMap,
          f: fMap,
          b: bArr,
        };
      }
    }

    // 8) 处理include和exclude

    const s = await this.repo.findOne({
      id: repoID,
    });

    const sss = testExclude(result, s?.config);

    // 8) 返回文件路径 -> 覆盖详情 的字典
    return sss;
  }

  async getMapForPull({
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
    mode?: string;
  }) {
    // 1) 仅支持 gitlab，其他 provider 直接返回空
    if (provider !== 'gitlab') return {};

    // 2) 读取系统配置/环境变量中的 GitLab 访问参数
    const baseUrl =
      (await this.syscfg?.get('system_config.gitlab_base_url')) ||
      process.env.GITLAB_BASE_URL;
    const token =
      (await this.syscfg?.get('git_provider[0].private_token')) ||
      process.env.GITLAB_TOKEN;
    if (!baseUrl || !token) {
      return {};
    }

    // 3) 计算项目 ID 与请求头
    const projectId = encodeURIComponent(repoID);
    const headers = { 'PRIVATE-TOKEN': token } as Record<string, string>;

    // 4) 获取 MR 基本信息与 headSha
    const mrResp = await axios.get(
      `${baseUrl}/api/v4/projects/${projectId}/merge_requests/${pullNumber}`,
      { headers },
    );
    if (mrResp.status < 200 || mrResp.status >= 300) return {};
    const mr: { diff_refs?: { head_sha?: string }; sha?: string } = mrResp.data;
    const headSha: string | undefined = mr?.diff_refs?.head_sha || mr?.sha;
    if (!headSha) return {};

    // 5) 获取 MR 所有提交，按 commit 列表构建 sha 集合
    const commitsResp = await axios.get(
      `${baseUrl}/api/v4/projects/${projectId}/merge_requests/${pullNumber}/commits`,
      { headers },
    );
    if (commitsResp.status < 200 || commitsResp.status >= 300) return {};
    const commits: Array<{ id: string }> = commitsResp.data as Array<{
      id: string;
    }>;
    if (!Array.isArray(commits) || commits.length === 0) return {};

    // 6) 查询这些提交对应的覆盖记录，并选出 baseline（headSha 优先）
    const shas = commits.map((c) => c.id);
    const covWhere: {
      provider: string;
      repoID: string;
      sha: { $in: string[] };
    } = { provider, repoID: repoID, sha: { $in: shas } };
    const allCov = await this.covRepo.find(covWhere, {
      fields: ['id', 'sha', 'instrumentCwd'],
    });
    if (!allCov.length) return {};

    // 7) 预先准备：建立 coverageID -> 覆盖记录 的映射，并确定 baseline 信息
    const covByID = new Map(allCov.map((c) => [c.id, c] as const));
    const baseSet = new Set<string>();
    for (const c of allCov) if (c.sha === headSha) baseSet.add(c.id);
    if (baseSet.size === 0) baseSet.add(allCov[0].id);
    const baselineCovID = [...baseSet][0];
    // const baselineCwd = covByID.get(baselineCovID)?.instrumentCwd || '';

    // 8) 拉取路径与结构哈希的关系（可按 filePath 过滤）
    const covIds = allCov.map((c) => c.id);
    const relWhere: {
      coverageID: { $in: string[] };
      filePath?: string | RegExp;
    } = {
      coverageID: { $in: covIds },
      filePath: /^(?!dist).*/,
    };
    if (filePath) relWhere.filePath = filePath;
    const relationsAll = await this.relRepo.find(relWhere, {
      fields: ['coverageID', 'coverageMapHashID', 'fullFilePath'],
    });

    // 9) 从 ClickHouse 聚合命中（带 coverageID，用于分组/过滤）
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

    // 10) 非 fileMerge 模式：计算每个提交的变更路径集合
    const changesBySha = new Map<string, Set<string>>();
    if (mode && mode.toLowerCase() !== 'filemerge') {
      for (const c of commits) {
        if (c.id === headSha) continue;
        const cmpResp = await axios.get(
          `${baseUrl}/api/v4/projects/${projectId}/repository/compare`,
          {
            headers,
            params: { from: c.id, to: headSha },
          },
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

    // 11) 初始化聚合数据结构与辅助方法
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

    // 12) 预加载结构：构建 (coverageID|规范化路径)->hash，拉取 hash->结构，按规范化路径挑选一个结构（优先 baseline）
    const covPathToHash = new Map<string, string>();
    const relPathSet = new Set<string>();
    for (const r of relationsAll) {
      const cov = covByID.get(r.coverageID);
      if (!cov) continue;
      const rel = trimInstrumentCwd(r.fullFilePath, cov.instrumentCwd);
      relPathSet.add(rel);
      covPathToHash.set(`${r.coverageID}|${rel}`, r.coverageMapHashID);
    }
    const allHashes = Array.from(
      new Set(relationsAll.map((r) => r.coverageMapHashID)),
    );
    const hashToMap =
      await this.mapStore.fetchCoverageMapsFromClickHouse(allHashes);
    // 为每个规范化路径选取一个结构用于补齐（优先 baseline 覆盖）
    const pathToStructure = new Map<string, unknown>();
    for (const r of relationsAll) {
      const cov = covByID.get(r.coverageID);
      if (!cov) continue;
      const rel = trimInstrumentCwd(r.fullFilePath, cov.instrumentCwd);
      const struct = hashToMap.get(r.coverageMapHashID);
      if (!struct) continue;
      const existing = pathToStructure.get(rel);
      if (!existing || r.coverageID === baselineCovID) {
        pathToStructure.set(rel, struct);
      }
    }

    // 13) 汇总命中：在 blockMerge 模式下计算增量命中，否则直接累加
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
      const baseKey = `${baselineCovID}|${relPath}`;
      const otherKey = `${row.coverageID}|${relPath}`;
      const baseHash = covPathToHash.get(baseKey);
      const otherHash = covPathToHash.get(otherKey);
      if (!baseHash || !otherHash) continue;
      const baseMap = hashToMap.get(baseHash);
      const otherMap = hashToMap.get(otherHash);
      if (!baseMap || !otherMap) continue;

      const baseRel = relPath;
      const otherRel = relPath;
      const baseContent = await this.git
        .fetchGitLabFile(baseUrl, projectId, headSha, baseRel, headers)
        .catch(() => '');
      const otherContent = await this.git
        .fetchGitLabFile(baseUrl, projectId, cov.sha, otherRel, headers)
        .catch(() => '');
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

    // 14) 输出：修剪路径、补齐 0 值、转换分支数组并返回（结构与 getMapForCommit 保持一致）
    const out: Record<string, unknown> = {};
    for (const [relPath, agg] of aggregated) {
      const path = relPath;
      const struct = pathToStructure.get(relPath) as
        | {
            statementMap?: Record<string, unknown>;
            fnMap?: Record<string, unknown>;
            branchMap?: Record<string, { locations?: unknown[] }>;
          }
        | undefined;
      const sMap: Record<string, number> = { ...(agg.S || {}) };
      const fMap: Record<string, number> = { ...(agg.F || {}) };
      // 按结构补齐未返回的 0 值
      if (struct?.statementMap) {
        for (const id of Object.keys(struct.statementMap)) {
          if (sMap[id] === undefined) sMap[id] = 0;
        }
      }
      if (struct?.fnMap) {
        for (const id of Object.keys(struct.fnMap)) {
          if (fMap[id] === undefined) fMap[id] = 0;
        }
      }
      const bArr = transformFlatBranchHitsToArrays(agg.B, struct?.branchMap);
      out[path] = {
        path,
        ...(struct as Record<string, unknown>),
        s: sMap,
        f: fMap,
        b: bArr,
      };
    }
    return out;
  }
}

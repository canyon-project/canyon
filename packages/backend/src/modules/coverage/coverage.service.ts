import { BadRequestException, Injectable, Optional } from '@nestjs/common';
import { EntityRepository, MikroORM } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import axios from 'axios';
import { CoverageEntity } from '../../entities/coverage.entity';
import { CoverageMapRelationEntity } from '../../entities/coverage-map-relation.entity';
import { ChService } from '../ch/ch.service';
import { SystemConfigService } from '../system-config/system-config.service';
import { tupleToMap, trimInstrumentCwd, mergeStatementHitsByBlock, mergeFunctionHitsByBlock } from './coverage.utils';


@Injectable()
export class CoverageService {
  constructor(
    @Optional() private readonly orm?: MikroORM,
    private readonly ch?: ChService,
    private readonly syscfg?: SystemConfigService,
    @InjectRepository(CoverageEntity) private readonly covRepo?: EntityRepository<CoverageEntity>,
    @InjectRepository(CoverageMapRelationEntity) private readonly relRepo?: EntityRepository<CoverageMapRelationEntity>
  ) {}
  async getSummaryMap(q: any) {
    const { subject, subjectID, provider, repoID, buildProvider, buildID } = q ?? {};
    if (!provider || !repoID || !subject || !subjectID) {
      throw new BadRequestException('provider, repoID, subject, subjectID are required');
    }
    if (!buildProvider || !buildID) {
      throw new BadRequestException('buildProvider, buildID are required');
    }
    // TODO: 接入真实的覆盖率摘要映射
    return { ok: true, kind: 'summary-map', subject, subjectID };
  }

  async getMapForCommit({ provider, repoID, sha, buildProvider, buildID, filePath }: { provider: string; repoID: string; sha: string; buildProvider?: string; buildID?: string; filePath?: string }) {
    if (!this.orm || !this.ch) {
      // Postgres 或 ClickHouse 未配置时，返回空对象
      return {};
    }
    // 1) 从 Postgres 查询 coverage 列表（使用 Mikro-ORM）
    const qb: any = { provider, repoId: repoID, sha } as any;
    if (buildProvider) qb.buildProvider = buildProvider;
    if (buildID) qb.buildId = buildID;
    const coverages = await this.covRepo!.find(qb, { fields: ['id', 'instrumentCwd'] });
    if (!coverages?.length) return {};

    const coverageIDs = coverages.map((c: any) => c.id);

    // 2) ClickHouse 查询 hits 聚合
    const db = process.env.CLICKHOUSE_DATABASE || 'default';
    const idsList = coverageIDs.map((id) => `'${id.replace(/'/g, "''")}'`).join(',');
    const hitQuery = `
      SELECT
        full_file_path as fullFilePath,
        sumMapMerge(s) as s,
        sumMapMerge(f) as f,
        sumMapMerge(b) as b
      FROM ${db}.coverage_hit_agg
      WHERE coverage_id IN (${idsList})
      ${filePath ? ` AND endsWith(full_file_path, '${filePath.replace(/'/g, "''")}')` : ''}
      GROUP BY full_file_path
    `;
    const ch = this.ch.getClient();
    const hitRes = await ch.query({ query: hitQuery, format: 'JSONEachRow' });
    const rows: Array<{ fullFilePath: string; s: [number[], number[]] | any; f: [number[], number[]] | any; b: [number[], number[]] | any }> = await hitRes.json();

    // 3) 关系去重：为每个文件挑选一个 coverage_map_hash_id，并拉取 coverage_map 结构
    const instrumentCwd = (coverages[0] as any)?.instrumentCwd || '';
    const relWhere: any = { coverageId: { $in: coverageIDs } } as any;
    if (filePath) relWhere.filePath = filePath;
    const relationsAll = await this.relRepo!.find(relWhere, { fields: ['coverageMapHashId', 'fullFilePath'] });
    const pathToHash = new Map<string, string>();
    for (const r of relationsAll as any[]) {
      if (!pathToHash.has(r.fullFilePath)) pathToHash.set(r.fullFilePath, r.coverageMapHashId);
    }
    const allHashes = Array.from(new Set(Array.from(pathToHash.values())));
    const hashToMap = await this.fetchCoverageMapsFromClickHouse(allHashes);

    // 4) 组装结果（命中 + 结构）并移除 instrument_cwd 前缀
    const trimPath = (p: string) => trimInstrumentCwd(p, instrumentCwd);

    const result: Record<string, any> = {};
    for (const r of rows || []) {
      const path = trimPath(r.fullFilePath);
      const hash = pathToHash.get(r.fullFilePath);
      const structure = hash ? hashToMap.get(hash) : undefined;
      result[path] = {
        path,
        ...(structure
          ? {
              statementMap: structure.statementMap,
              fnMap: structure.fnMap,
              branchMap: structure.branchMap
            }
          : {}),
        s: tupleToMap(r.s),
        f: tupleToMap(r.f),
        b: tupleToMap(r.b)
      };
    }
    return result;
  }

  async getMapForPull({ provider, repoID, pullNumber, buildProvider, buildID, filePath, mode }: { provider: string; repoID: string; pullNumber: string; buildProvider?: string; buildID?: string; filePath?: string; mode?: string }) {
    if (!this.orm || !this.ch) return {};
    if (provider !== 'gitlab') return {};

    const baseUrl = (await this.syscfg?.get('system_config.gitlab_base_url')) || process.env.GITLAB_BASE_URL;
    const token = (await this.syscfg?.get('git_provider[0].private_token')) || process.env.GITLAB_TOKEN;
    if (!baseUrl || !token) {
      return {};
    }

    const projectId = encodeURIComponent(repoID);
    const headers = { 'PRIVATE-TOKEN': token } as Record<string, string>;

    const mrResp = await axios.get(`${baseUrl}/api/v4/projects/${projectId}/merge_requests/${pullNumber}`, { headers });
    if (mrResp.status < 200 || mrResp.status >= 300) return {};
    const mr: any = mrResp.data;
    const headSha: string | undefined = mr?.diff_refs?.head_sha || mr?.sha;
    if (!headSha) return {};

    // commits
    const commitsResp = await axios.get(`${baseUrl}/api/v4/projects/${projectId}/merge_requests/${pullNumber}/commits`, { headers });
    if (commitsResp.status < 200 || commitsResp.status >= 300) return {};
    const commits: Array<{ id: string }> = commitsResp.data;
    if (!Array.isArray(commits) || commits.length === 0) return {};

    // coverage rows for SHAs
    const shas = commits.map((c) => c.id);
    const covWhere: any = { provider, repoId: repoID, sha: { $in: shas } } as any;
    if (buildProvider) covWhere.buildProvider = buildProvider;
    if (buildID) covWhere.buildId = buildID;
    const allCov = await this.covRepo!.find(covWhere, { fields: ['id', 'sha', 'instrumentCwd'] });
    if (!allCov?.length) return {};

    // relations (all and unique per file)
    const covIds = allCov.map((c: any) => c.id);
    const relWhere: any = { coverageId: { $in: covIds } } as any;
    if (filePath) relWhere.filePath = filePath;
    const relationsAll = await this.relRepo!.find(relWhere, { fields: ['coverageId', 'coverageMapHashId', 'fullFilePath'] });
    // unique by (coverage_map_hash_id, full_file_path)
    const seen = new Set<string>();
    const relations = [] as Array<{ coverage_map_hash_id: string; full_file_path: string }>
    for (const r of relationsAll as any[]) {
      const key = `${r.coverageMapHashId}|${r.fullFilePath}`;
      if (seen.has(key)) continue;
      seen.add(key);
      relations.push({ coverage_map_hash_id: r.coverageMapHashId, full_file_path: r.fullFilePath });
    }

    // ClickHouse hits with coverage_id
    const db = process.env.CLICKHOUSE_DATABASE || 'default';
    const idsList = covIds.map((id) => `'${id.replace(/'/g, "''")}'`).join(',');
    const hitQuery = `
      SELECT
        coverage_id as coverageID,
        full_file_path as fullFilePath,
        sumMapMerge(s) as s,
        sumMapMerge(f) as f,
        sumMapMerge(b) as b
      FROM ${db}.coverage_hit_agg
      WHERE coverage_id IN (${idsList})
      ${filePath ? ` AND endsWith(full_file_path, '${filePath.replace(/'/g, "''")}')` : ''}
      GROUP BY coverage_id, full_file_path
    `;
    const ch = this.ch.getClient();
    const hitRes = await ch.query({ query: hitQuery, format: 'JSONEachRow' });
    const hitRows: Array<{ coverageID: string; fullFilePath: string; s: any; f: any; b: any }> = await hitRes.json();

    const covByID = new Map(allCov.map((c: any) => [c.id, c] as const));
    const baseSet = new Set<string>();
    for (const c of allCov) if (c.sha === headSha) baseSet.add(c.id);
    if (baseSet.size === 0) baseSet.add(allCov[0].id);
    const baselineCovID = [...baseSet][0];
    const baselineCwd = (covByID.get(baselineCovID) as any)?.instrumentCwd || '';

    // changed files set per SHA (best-effort)
    const changesBySha = new Map<string, Set<string>>();
    if (mode && mode.toLowerCase() !== 'filemerge') {
      for (const c of commits) {
        if (c.id === headSha) continue;
        const cmpResp = await axios.get(`${baseUrl}/api/v4/projects/${projectId}/repository/compare`, {
          headers,
          params: { from: c.id, to: headSha }
        });
        if (cmpResp.status < 200 || cmpResp.status >= 300) continue;
        const cmp: any = cmpResp.data;
        const s = new Set<string>();
        for (const d of cmp?.diffs || []) {
          if (d?.old_path) s.add(d.old_path);
          if (d?.new_path) s.add(d.new_path);
        }
        changesBySha.set(c.id, s);
      }
    }

    // 使用工具函数 tupleToMap

    // aggregate
    const aggregated = new Map<string, { S: Record<string, number>; F: Record<string, number>; B: Record<string, number> }>();
    const ensure = (path: string) => {
      if (!aggregated.has(path)) aggregated.set(path, { S: {}, F: {}, B: {} });
      return aggregated.get(path)!;
    };
    const isBlockMerge = (mode || '').toLowerCase() === 'blockmerge';

    // coverage_map structures for block merge
    const covPathToHash = new Map<string, string>();
    for (const r of relationsAll) {
      covPathToHash.set(`${r.coverageId}|${r.fullFilePath}`, r.coverageMapHashId);
    }
    const allHashes = Array.from(new Set(relations.map((r) => r.coverage_map_hash_id)));
    const hashToMap = await this.fetchCoverageMapsFromClickHouse(allHashes);

    for (const row of hitRows) {
      const cov = covByID.get(row.coverageID);
      if (!cov) continue;
      const isBaseline = baseSet.has(row.coverageID);
      const relPath = trimInstrumentCwd(row.fullFilePath, (cov as any).instrumentCwd || '');
      let include = isBaseline;
      if (!isBaseline) {
        const changed = changesBySha.get(cov.sha);
        include = !(changed && changed.has(relPath));
      }
      if (include || !isBlockMerge) {
        const agg = ensure(row.fullFilePath);
        const s = tupleToMap(row.s);
        const f = tupleToMap(row.f);
        const b = tupleToMap(row.b);
        for (const [k, v] of Object.entries(s)) agg.S[k] = (agg.S[k] || 0) + v;
        for (const [k, v] of Object.entries(f)) agg.F[k] = (agg.F[k] || 0) + v;
        for (const [k, v] of Object.entries(b)) agg.B[k] = (agg.B[k] || 0) + v;
        continue;
      }
      // blockMerge 精细合并：将 other 的函数/语句命中映射到 baseline 的 id 上
      const baseKey = `${baselineCovID}|${row.fullFilePath}`;
      const otherKey = `${row.coverageID}|${row.fullFilePath}`;
      const baseHash = covPathToHash.get(baseKey);
      const otherHash = covPathToHash.get(otherKey);
      if (!baseHash || !otherHash) continue;
      const baseMap = hashToMap.get(baseHash);
      const otherMap = hashToMap.get(otherHash);
      if (!baseMap || !otherMap) continue;

      const baseRel = trimInstrumentCwd(row.fullFilePath, baselineCwd);
      const otherRel = relPath;
      const baseContent = await this.fetchGitLabFile(baseUrl, projectId, headSha, baseRel, headers).catch(() => '');
      const otherContent = await this.fetchGitLabFile(baseUrl, projectId, cov.sha, otherRel, headers).catch(() => '');
      const stmtInc = mergeStatementHitsByBlock(
        baseContent,
        baseMap.statementMap,
        otherContent,
        otherMap.statementMap,
        tupleToMap(row.s)
      );
      const fnInc = mergeFunctionHitsByBlock(
        baseContent,
        baseMap.fnMap,
        otherContent,
        otherMap.fnMap,
        tupleToMap(row.f)
      );
      const agg = ensure(row.fullFilePath);
      for (const [k, v] of Object.entries(stmtInc)) agg.S[k] = (agg.S[k] || 0) + (v as number);
      for (const [k, v] of Object.entries(fnInc)) agg.F[k] = (agg.F[k] || 0) + (v as number);
    }

    // build result using baseline cwd to trim paths
    const out: Record<string, any> = {};
    for (const [absPath, agg] of aggregated) {
      const path = trimInstrumentCwd(absPath, baselineCwd);
      out[path] = { path, s: agg.S, f: agg.F, b: agg.B };
    }
    return out;
  }

  private async fetchCoverageMapsFromClickHouse(hashList: string[]) {
    const out = new Map<string, { statementMap: Record<string, any>; fnMap: Record<string, any>; branchMap: Record<string, any> }>();
    if (!this.ch || hashList.length === 0) return out;
    const db = process.env.CLICKHOUSE_DATABASE || 'default';
    const hashes = hashList.map((h) => `'${h.replace(/'/g, "''")}'`).join(',');
    const query = `
      SELECT
        statement_map as statementMap,
        fn_map as fnMap,
        branch_map as branchMap,
        hash as coverageMapHashID
      FROM ${db}.coverage_map
      WHERE hash IN (${hashes})
    `;
    const res = await this.ch.getClient().query({ query, format: 'JSONEachRow' });
    const rows: Array<{ statementMap: Record<string, any>; fnMap: Record<string, any>; branchMap: Record<string, any>; coverageMapHashID: string }> = await res.json();
    for (const r of rows) {
      // statement_map → { id: { start_line, start_column, end_line, end_column } }
      const normalizedStmt: Record<string, any> = {};
      const srcStmt = r.statementMap || {};
      for (const [id, tuple] of Object.entries(srcStmt)) {
        const arr = Array.isArray(tuple) ? (tuple as any[]) : [];
        normalizedStmt[id] = {
          start_line: Number(arr[0] ?? 0),
          start_column: Number(arr[1] ?? 0),
          end_line: Number(arr[2] ?? 0),
          end_column: Number(arr[3] ?? 0)
        };
      }

      // fn_map → { id: { name, line, start_pos: [4], end_pos: [4] } }
      const normalizedFn: Record<string, any> = {};
      const srcFn = r.fnMap || {};
      for (const [id, tuple] of Object.entries(srcFn)) {
        const arr = Array.isArray(tuple) ? (tuple as any[]) : [];
        const name = String(arr[0] ?? '');
        const line = Number(arr[1] ?? 0);
        const startPos = Array.isArray(arr[2]) ? (arr[2] as any[]) : [];
        const endPos = Array.isArray(arr[3]) ? (arr[3] as any[]) : [];
        normalizedFn[id] = {
          name,
          line,
          start_pos: [Number(startPos[0] ?? 0), Number(startPos[1] ?? 0), Number(startPos[2] ?? 0), Number(startPos[3] ?? 0)],
          end_pos: [Number(endPos[0] ?? 0), Number(endPos[1] ?? 0), Number(endPos[2] ?? 0), Number(endPos[3] ?? 0)]
        };
      }

      // branch_map → { id: { type, line, position: [4], paths: [ [4], ... ] } }
      const normalizedBranch: Record<string, any> = {};
      const srcBranch = r.branchMap || {};
      for (const [id, tuple] of Object.entries(srcBranch)) {
        const arr = Array.isArray(tuple) ? (tuple as any[]) : [];
        const type = Number(arr[0] ?? 0);
        const line = Number(arr[1] ?? 0);
        const posArr = Array.isArray(arr[2]) ? (arr[2] as any[]) : [];
        const position = [Number(posArr[0] ?? 0), Number(posArr[1] ?? 0), Number(posArr[2] ?? 0), Number(posArr[3] ?? 0)];
        const pathsArr = Array.isArray(arr[3]) ? (arr[3] as any[]) : [];
        const paths: Array<[number, number, number, number]> = [];
        for (const p of pathsArr) {
          const pa = Array.isArray(p) ? (p as any[]) : [];
          paths.push([Number(pa[0] ?? 0), Number(pa[1] ?? 0), Number(pa[2] ?? 0), Number(pa[3] ?? 0)]);
        }
        normalizedBranch[id] = { type, line, position, paths };
      }

      out.set(r.coverageMapHashID, {
        statementMap: normalizedStmt,
        fnMap: normalizedFn,
        branchMap: normalizedBranch
      });
    }
    return out;
  }

  private async fetchGitLabFile(baseUrl: string, projectId: string, sha: string, path: string, headers: Record<string, string>): Promise<string> {
    const filePath = encodeURIComponent(path);
    const url = `${baseUrl}/api/v4/projects/${projectId}/repository/files/${filePath}/raw`;
    const resp = await axios.get(url, { headers, params: { ref: sha }, responseType: 'text' });
    if (resp.status < 200 || resp.status >= 300) return '';
    return resp.data as string;
  }

}



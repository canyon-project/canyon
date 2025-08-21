import { BadRequestException, Injectable, Optional } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';
import { ChService } from '../ch/ch.service';
import { SystemConfigService } from '../system-config/system-config.service';

interface OverviewQuery {
  subject: string;
  subjectID: string;
  provider: string;
  repoID: string;
}

@Injectable()
export class CoverageService {
  constructor(
    @Optional() private readonly orm?: MikroORM,
    private readonly ch?: ChService,
    private readonly syscfg?: SystemConfigService
  ) {}
  async getOverview(q: OverviewQuery) {
    const { subject, subjectID, provider, repoID } = q;
    if (!provider || !repoID || !subject || !subjectID) {
      throw new BadRequestException('provider, repoID, subject, subjectID are required');
    }
    switch (subject) {
      case 'commit':
      case 'commits':
        // TODO: 接入真实的覆盖率查询
        return { type: 'commit', repoID, sha: subjectID };
      case 'pull':
      case 'pulls':
        // TODO: 接入真实的覆盖率查询
        return { type: 'pull', repoID, pullNumber: subjectID };
      default:
        throw new BadRequestException('invalid subject');
    }
  }

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

  async getMap(q: any) {
    const { subject, subjectID, provider, repoID, buildProvider, buildID, filePath, mode } = q ?? {};
    if (!provider || !repoID || !subject || !subjectID) {
      throw new BadRequestException('provider, repoID, subject, subjectID are required');
    }

    if (subject === 'commit' || subject === 'commits') {
      return this.getMapForCommit({ provider, repoID, sha: subjectID, buildProvider, buildID, filePath });
    }

    if (subject === 'pull' || subject === 'pulls') {
      return this.getMapForPull({ provider, repoID, pullNumber: subjectID, buildProvider, buildID, filePath, mode });
    }

    throw new BadRequestException('invalid subject');
  }

  private async getMapForCommit({ provider, repoID, sha, buildProvider, buildID, filePath }: { provider: string; repoID: string; sha: string; buildProvider?: string; buildID?: string; filePath?: string }) {
    if (!this.orm || !this.ch) {
      // Postgres 或 ClickHouse 未配置时，返回空对象
      return {};
    }
    // 1) 从 Postgres 查询 coverage 列表
    const knex = this.orm.em.getConnection();
    const where: string[] = [
      `provider = ?`,
      `repo_id = ?`,
      `sha = ?`
    ];
    const params: any[] = [provider, repoID, sha];
    if (buildProvider) {
      where.push(`build_provider = ?`);
      params.push(buildProvider);
    }
    if (buildID) {
      where.push(`build_id = ?`);
      params.push(buildID);
    }
    const sql = `SELECT id, instrument_cwd FROM canyonjs_coverage WHERE ${where.join(' AND ')}`;
    const coverages: Array<{ id: string; instrument_cwd: string | null }> = await knex.execute(sql, params);
    if (!coverages?.length) return {};

    const coverageIDs = coverages.map((c) => c.id);

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
      ${filePath ? ` AND file_path = '${filePath.replace(/'/g, "''")}'` : ''}
      GROUP BY full_file_path
      FORMAT JSONEachRow
    `;
    const ch = this.ch.getClient();
    const hitRes = await ch.query({ query: hitQuery, format: 'JSONEachRow' });
    const rows: Array<{ fullFilePath: string; s: [number[], number[]] | any; f: [number[], number[]] | any; b: [number[], number[]] | any }> = await hitRes.json();

    // 3) 组装结果（仅 hits，后续可加入 coverage_map 结构）并移除 instrument_cwd 前缀
    const instrumentCwd = coverages[0]?.instrument_cwd || '';
    const trimPath = (p: string) => {
      if (!instrumentCwd) return p;
      let np = p.startsWith(instrumentCwd) ? p.slice(instrumentCwd.length) : p;
      if (np.startsWith('/')) np = np.slice(1);
      return np;
    };

    const convertTupleToMap = (tuple: any): Record<string, number> => {
      // tuple = [keys[], values[]]
      if (!Array.isArray(tuple) || tuple.length !== 2) return {} as any;
      const [keys, values] = tuple as [any[], any[]];
      const out: Record<string, number> = {};
      const len = Math.min(keys?.length ?? 0, values?.length ?? 0);
      for (let i = 0; i < len; i++) {
        const k = String(keys[i]);
        const v = Number(values[i] ?? 0);
        out[k] = v;
      }
      return out;
    };

    const result: Record<string, any> = {};
    for (const r of rows || []) {
      const path = trimPath(r.fullFilePath);
      result[path] = {
        path,
        s: convertTupleToMap(r.s),
        f: convertTupleToMap(r.f),
        b: convertTupleToMap(r.b)
      };
    }
    return result;
  }

  private async getMapForPull({ provider, repoID, pullNumber, buildProvider, buildID, filePath, mode }: { provider: string; repoID: string; pullNumber: string; buildProvider?: string; buildID?: string; filePath?: string; mode?: string }) {
    if (!this.orm || !this.ch) return {};
    if (provider !== 'gitlab') return {};

    const baseUrl = (await this.syscfg?.get('system_config.gitlab_base_url')) || process.env.GITLAB_BASE_URL;
    const token = (await this.syscfg?.get('git_provider[0].private_token')) || process.env.GITLAB_TOKEN;
    if (!baseUrl || !token) {
      return {};
    }

    const projectId = encodeURIComponent(repoID);
    const headers = { 'PRIVATE-TOKEN': token } as Record<string, string>;

    const mrResp = await fetch(`${baseUrl}/api/v4/projects/${projectId}/merge_requests/${pullNumber}` as any, { headers });
    if (!mrResp.ok) return {};
    const mr: any = await mrResp.json();
    const headSha: string | undefined = mr?.diff_refs?.head_sha || mr?.sha;
    if (!headSha) return {};

    // commits
    const commitsResp = await fetch(`${baseUrl}/api/v4/projects/${projectId}/merge_requests/${pullNumber}/commits` as any, { headers });
    if (!commitsResp.ok) return {};
    const commits: Array<{ id: string }> = await commitsResp.json();
    if (!Array.isArray(commits) || commits.length === 0) return {};

    // coverage rows for SHAs
    const knex = this.orm.em.getConnection();
    const shas = commits.map((c) => c.id);
    const where: string[] = [`provider = ?`, `repo_id = ?`, `sha = ANY(?)`];
    const params: any[] = [provider, repoID, shas];
    if (buildProvider) {
      where.push(`build_provider = ?`);
      params.push(buildProvider);
    }
    if (buildID) {
      where.push(`build_id = ?`);
      params.push(buildID);
    }
    const covSql = `SELECT id, sha, instrument_cwd FROM canyonjs_coverage WHERE ${where.join(' AND ')}`;
    const allCov: Array<{ id: string; sha: string; instrument_cwd: string | null }> = await knex.execute(covSql, params);
    if (!allCov?.length) return {};

    // relations (all and unique per file)
    const covIds = allCov.map((c) => c.id);
    const relBaseSql = `SELECT coverage_id, coverage_map_hash_id, full_file_path FROM canyonjs_coverage_map_relation WHERE coverage_id = ANY(?)${filePath ? ' AND file_path = ?' : ''}`;
    const relParams: any[] = [covIds];
    if (filePath) relParams.push(filePath);
    const relationsAll: Array<{ coverage_id: string; coverage_map_hash_id: string; full_file_path: string }> = await knex.execute(relBaseSql, relParams);
    const uniqSql = `SELECT coverage_map_hash_id, full_file_path FROM canyonjs_coverage_map_relation WHERE coverage_id = ANY(?)${filePath ? ' AND file_path = ?' : ''} GROUP BY coverage_map_hash_id, full_file_path`;
    const relations: Array<{ coverage_map_hash_id: string; full_file_path: string }> = await knex.execute(uniqSql, relParams);

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
      ${filePath ? ` AND file_path = '${filePath.replace(/'/g, "''")}'` : ''}
      GROUP BY coverage_id, full_file_path
      FORMAT JSONEachRow
    `;
    const ch = this.ch.getClient();
    const hitRes = await ch.query({ query: hitQuery, format: 'JSONEachRow' });
    const hitRows: Array<{ coverageID: string; fullFilePath: string; s: any; f: any; b: any }> = await hitRes.json();

    const covByID = new Map(allCov.map((c) => [c.id, c] as const));
    const baseSet = new Set<string>();
    for (const c of allCov) if (c.sha === headSha) baseSet.add(c.id);
    if (baseSet.size === 0) baseSet.add(allCov[0].id);
    const baselineCovID = [...baseSet][0];
    const baselineCwd = covByID.get(baselineCovID)?.instrument_cwd || '';

    // changed files set per SHA (best-effort)
    const changesBySha = new Map<string, Set<string>>();
    if (mode && mode.toLowerCase() !== 'filemerge') {
      for (const c of commits) {
        if (c.id === headSha) continue;
        const cmpResp = await fetch(`${baseUrl}/api/v4/projects/${projectId}/repository/compare?from=${encodeURIComponent(c.id)}&to=${encodeURIComponent(headSha)}` as any, { headers });
        if (!cmpResp.ok) continue;
        const cmp: any = await cmpResp.json();
        const s = new Set<string>();
        for (const d of cmp?.diffs || []) {
          if (d?.old_path) s.add(d.old_path);
          if (d?.new_path) s.add(d.new_path);
        }
        changesBySha.set(c.id, s);
      }
    }

    const tupleToMap = (t: any) => {
      if (!Array.isArray(t) || t.length !== 2) return {} as Record<string, number>;
      const [k, v] = t as [any[], any[]];
      const out: Record<string, number> = {};
      const len = Math.min(k?.length ?? 0, v?.length ?? 0);
      for (let i = 0; i < len; i++) out[String(k[i])] = Number(v[i] ?? 0);
      return out;
    };

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
      covPathToHash.set(`${r.coverage_id}|${r.full_file_path}`, r.coverage_map_hash_id);
    }
    const allHashes = Array.from(new Set(relations.map((r) => r.coverage_map_hash_id)));
    const hashToMap = await this.fetchCoverageMapsFromClickHouse(allHashes);

    for (const row of hitRows) {
      const cov = covByID.get(row.coverageID);
      if (!cov) continue;
      const isBaseline = baseSet.has(row.coverageID);
      const relPath = this.trimInstrumentCwd(row.fullFilePath, cov.instrument_cwd || '');
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

      const baseRel = this.trimInstrumentCwd(row.fullFilePath, baselineCwd);
      const otherRel = relPath;
      const baseContent = await this.fetchGitLabFile(baseUrl, projectId, headSha, baseRel, headers).catch(() => '');
      const otherContent = await this.fetchGitLabFile(baseUrl, projectId, cov.sha, otherRel, headers).catch(() => '');
      const stmtInc = this.mergeStatementHitsByBlock(
        baseContent,
        baseMap.statementMap,
        otherContent,
        otherMap.statementMap,
        tupleToMap(row.s)
      );
      const fnInc = this.mergeFunctionHitsByBlock(
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
      const path = this.trimInstrumentCwd(absPath, baselineCwd);
      out[path] = { path, s: agg.S, f: agg.F, b: agg.B };
    }
    return out;
  }

  private trimInstrumentCwd(p: string, instrumentCwd: string): string {
    if (!instrumentCwd) return p;
    let np = p.startsWith(instrumentCwd) ? p.slice(instrumentCwd.length) : p;
    if (np.startsWith('/')) np = np.slice(1);
    return np;
  }

  private async fetchCoverageMapsFromClickHouse(hashList: string[]) {
    const out = new Map<string, { statementMap: Record<string, any>; fnMap: Record<string, any>; branchMap: Record<string, any> }>();
    if (!this.ch || hashList.length === 0) return out;
    const db = process.env.CLICKHOUSE_DATABASE || 'default';
    const hashes = hashList.map((h) => `'${h.replace(/'/g, "''")}'`).join(',');
    const query = `
      SELECT toJSONString(statement_map) as statementMap,
             toJSONString(fn_map) as fnMap,
             toJSONString(branch_map) as branchMap,
             hash as coverageMapHashID
      FROM ${db}.coverage_map
      WHERE hash IN (${hashes})
      FORMAT JSONEachRow
    `;
    const res = await this.ch.getClient().query({ query, format: 'JSONEachRow' });
    const rows: Array<{ statementMap: string; fnMap: string; branchMap: string; coverageMapHashID: string }> = await res.json();
    for (const r of rows) {
      try {
        const s = JSON.parse(r.statementMap || '{}');
        const f = JSON.parse(r.fnMap || '{}');
        const b = JSON.parse(r.branchMap || '{}');
        out.set(r.coverageMapHashID, { statementMap: s, fnMap: f, branchMap: b });
      } catch {
        // ignore malformed row
      }
    }
    return out;
  }

  private async fetchGitLabFile(baseUrl: string, projectId: string, sha: string, path: string, headers: Record<string, string>): Promise<string> {
    const filePath = encodeURIComponent(path);
    const url = `${baseUrl}/api/v4/projects/${projectId}/repository/files/${filePath}/raw?ref=${encodeURIComponent(sha)}`;
    const resp = await fetch(url as any, { headers });
    if (!resp.ok) return '';
    return await resp.text();
  }

  private canonicalizeSnippet(s: string): string {
    return s.replace(/\s+/g, '');
  }
  private computeLineStarts(content: string): number[] {
    const starts = [0];
    for (let i = 0; i < content.length; i++) if (content[i] === '\n') starts.push(i + 1);
    return starts;
  }
  private posToOffset(line: number, col: number, starts: number[]): number {
    let idx = Math.max(0, Math.min(starts.length - 1, line - 1));
    return starts[idx] + col;
  }
  private sliceByStmtLoc(content: string, info: any, starts: number[]): [string, number] {
    const start = this.posToOffset(Number(info.start_line || info.startLine || 0), Number(info.start_column || info.startColumn || 0), starts);
    const end = this.posToOffset(Number(info.end_line || info.endLine || 0), Number(info.end_column || info.endColumn || 0), starts);
    const s = Math.max(0, Math.min(start, content.length));
    const e = Math.max(s, Math.min(end, content.length));
    return [content.slice(s, e), s];
  }
  private buildStmtHashGroups(content: string, stmtMap: Record<string, any>): Map<string, Array<{ id: string; pos: number }>> {
    const groups = new Map<string, Array<{ id: string; pos: number }>>();
    if (!stmtMap) return groups;
    const starts = this.computeLineStarts(content);
    for (const [id, st] of Object.entries(stmtMap)) {
      const [code, pos] = this.sliceByStmtLoc(content, st, starts);
      const h = this.canonicalizeSnippet(code);
      const arr = groups.get(h) || [];
      arr.push({ id, pos });
      groups.set(h, arr);
    }
    for (const [h, arr] of groups) arr.sort((a, b) => a.pos - b.pos), groups.set(h, arr);
    return groups;
  }
  private sliceByFnLoc(content: string, info: any, starts: number[]): [string, number] {
    const endPos = info.end_pos || info.endPos || [0, 0, 0, 0];
    const start = this.posToOffset(Number(endPos[0] || 0), Number(endPos[1] || 0), starts);
    const end = this.posToOffset(Number(endPos[2] || 0), Number(endPos[3] || 0), starts);
    const s = Math.max(0, Math.min(start, content.length));
    const e = Math.max(s, Math.min(end, content.length));
    return [content.slice(s, e), s];
  }
  private buildFnHashGroups(content: string, fnMap: Record<string, any>): Map<string, Array<{ id: string; pos: number }>> {
    const groups = new Map<string, Array<{ id: string; pos: number }>>();
    if (!fnMap) return groups;
    const starts = this.computeLineStarts(content);
    for (const [id, fn] of Object.entries(fnMap)) {
      const [code, pos] = this.sliceByFnLoc(content, fn, starts);
      const h = this.canonicalizeSnippet(code);
      const arr = groups.get(h) || [];
      arr.push({ id, pos });
      groups.set(h, arr);
    }
    for (const [h, arr] of groups) arr.sort((a, b) => a.pos - b.pos), groups.set(h, arr);
    return groups;
  }
  private mergeStatementHitsByBlock(baseContent: string, baseStmtMap: Record<string, any>, otherContent: string, otherStmtMap: Record<string, any>, otherHits: Record<string, number>): Record<string, number> {
    const result: Record<string, number> = {};
    if (!baseStmtMap || !otherStmtMap || !otherHits) return result;
    const baseGroups = this.buildStmtHashGroups(baseContent, baseStmtMap);
    const otherGroups = this.buildStmtHashGroups(otherContent, otherStmtMap);
    for (const [h, baseNodes] of baseGroups) {
      const otherNodes = otherGroups.get(h);
      if (!otherNodes || otherNodes.length === 0) continue;
      const used = new Array<boolean>(otherNodes.length).fill(false);
      for (const bn of baseNodes) {
        let best = -1;
        let bestDist = Number.MAX_SAFE_INTEGER;
        for (let i = 0; i < otherNodes.length; i++) {
          if (used[i]) continue;
          const d = Math.abs(bn.pos - otherNodes[i].pos);
          if (d < bestDist) {
            bestDist = d;
            best = i;
          }
        }
        if (best >= 0) {
          used[best] = true;
          const inc = otherHits[String(otherNodes[best].id)] || 0;
          if (inc > 0) result[String(bn.id)] = (result[String(bn.id)] || 0) + inc;
        }
      }
    }
    return result;
  }
  private mergeFunctionHitsByBlock(baseContent: string, baseFnMap: Record<string, any>, otherContent: string, otherFnMap: Record<string, any>, otherHits: Record<string, number>): Record<string, number> {
    const result: Record<string, number> = {};
    if (!baseFnMap || !otherFnMap || !otherHits) return result;
    const baseGroups = this.buildFnHashGroups(baseContent, baseFnMap);
    const otherGroups = this.buildFnHashGroups(otherContent, otherFnMap);
    for (const [h, baseNodes] of baseGroups) {
      const otherNodes = otherGroups.get(h);
      if (!otherNodes || otherNodes.length === 0) continue;
      const used = new Array<boolean>(otherNodes.length).fill(false);
      for (const bn of baseNodes) {
        let best = -1;
        let bestDist = Number.MAX_SAFE_INTEGER;
        for (let i = 0; i < otherNodes.length; i++) {
          if (used[i]) continue;
          const d = Math.abs(bn.pos - otherNodes[i].pos);
          if (d < bestDist) {
            bestDist = d;
            best = i;
          }
        }
        if (best >= 0) {
          used[best] = true;
          const inc = otherHits[String(otherNodes[best].id)] || 0;
          if (inc > 0) result[String(bn.id)] = (result[String(bn.id)] || 0) + inc;
        }
      }
    }
    return result;
  }
}



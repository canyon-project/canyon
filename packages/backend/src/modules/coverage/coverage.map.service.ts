import { Injectable } from '@nestjs/common'
import { EntityRepository } from '@mikro-orm/core'
import { InjectRepository } from '@mikro-orm/nestjs'
import axios from 'axios'
import { CoverageEntity } from '../../entities/coverage.entity'
import { CoverageMapRelationEntity } from '../../entities/coverage-map-relation.entity'
import { ChService } from '../ch/ch.service'
import { SystemConfigService } from '../system-config/system-config.service'
import { CoverageMapStoreService } from './coverage.map-store.service'
import { CoverageGitService } from './coverage.git.service'
import { tupleToMap, trimInstrumentCwd, mergeStatementHitsByBlock, mergeFunctionHitsByBlock } from './coverage.utils'

// 将扁平化的分支命中键解码为 (branchId, armIndex)，并按 Istanbul 期望的数组形式聚合
const MAX_BRANCH_LENGTH = 10000
function decodeBranchKey(encodedKey: string | number): [number, number] {
  const k = Number(encodedKey || 0)
  const branchId = Math.floor(k / MAX_BRANCH_LENGTH)
  const armIndex = k % MAX_BRANCH_LENGTH
  return [branchId, armIndex]
}

function transformFlatBranchHitsToArrays(
  flat: Record<string, number>,
  branchMapStructure?: Record<string, any>,
): Record<string, number[]> {
  const out: Record<string, number[]> = {}
  if (flat) {
    for (const [k, v] of Object.entries(flat)) {
      const [id, idx] = decodeBranchKey(k)
      const key = String(id)
      if (!out[key]) out[key] = []
      out[key][idx] = Number(v || 0)
    }
  }
  // 根据结构补齐零值长度
  if (branchMapStructure) {
    for (const [id, info] of Object.entries(branchMapStructure)) {
      const key = String(id)
      const pathsLen = Array.isArray((info as any).locations) ? (info as any).locations.length : 0
      if (!out[key]) out[key] = new Array<number>(pathsLen).fill(0)
      else if (pathsLen > out[key].length) {
        out[key].length = pathsLen
        for (let i = 0; i < pathsLen; i++) if (out[key][i] === undefined) out[key][i] = 0
      } else {
        // 将未赋值的空位补 0
        for (let i = 0; i < out[key].length; i++) if (out[key][i] === undefined) out[key][i] = 0
      }
    }
  } else {
    // 没有结构时，也将未赋值的空位补 0，以避免稀疏数组
    for (const key of Object.keys(out)) {
      for (let i = 0; i < out[key].length; i++) if (out[key][i] === undefined) out[key][i] = 0
    }
  }
  return out
}

@Injectable()
export class CoverageMapService {
  constructor(
    private readonly ch: ChService,
    private readonly syscfg: SystemConfigService,
    private readonly mapStore: CoverageMapStoreService,
    private readonly git: CoverageGitService,
    @InjectRepository(CoverageEntity) private readonly covRepo: EntityRepository<CoverageEntity>,
    @InjectRepository(CoverageMapRelationEntity) private readonly relRepo: EntityRepository<CoverageMapRelationEntity>
  ) {}

  async getMapForCommit({ provider, repoID, sha, buildProvider, buildID, filePath }: { provider: string; repoID: string; sha: string; buildProvider?: string; buildID?: string; filePath?: string }) {
    const qb: any = { provider, repoID: repoID, sha } as any
    if (buildProvider) qb.buildProvider = buildProvider
    if (buildID) qb.buildID = buildID
    const coverages = await this.covRepo!.find(qb, { fields: ['id', 'instrumentCwd'] })
    if (!coverages?.length) return {}

    const coverageIDs = coverages.map((c: any) => c.id)
    const db = process.env.CLICKHOUSE_DATABASE || 'default'
    const idsList = coverageIDs.map((id) => `'${id.replace(/'/g, "''")}'`).join(',')
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
    `
    const ch = this.ch.getClient()
    const hitRes = await ch.query({ query: hitQuery, format: 'JSONEachRow' })
    const rows: Array<{ fullFilePath: string; s: [number[], number[]] | any; f: [number[], number[]] | any; b: [number[], number[]] | any }> = await hitRes.json()

    const instrumentCwd = (coverages[0] as any)?.instrumentCwd || ''
    const relWhere: any = { coverageID: { $in: coverageIDs } } as any
    if (filePath) relWhere.filePath = filePath
    const relationsAll = await this.relRepo!.find(relWhere, { fields: ['coverageMapHashID', 'fullFilePath'] })
    const pathToHash = new Map<string, string>()
    for (const r of relationsAll as any[]) {
      if (!pathToHash.has(r.fullFilePath)) pathToHash.set(r.fullFilePath, r.coverageMapHashID)
    }
    const allHashes = Array.from(new Set(Array.from(pathToHash.values())))
    const hashToMap = await this.mapStore.fetchCoverageMapsFromClickHouse(allHashes)

    const trimPath = (p: string) => trimInstrumentCwd(p, instrumentCwd)

    const result: Record<string, any> = {}
    for (const r of rows || []) {
      const path = trimPath(r.fullFilePath)
      const hash = pathToHash.get(r.fullFilePath)
      const structure = hash ? hashToMap.get(hash) : undefined
      const sMap = tupleToMap(r.s)
      const fMap = tupleToMap(r.f)
      const bFlat = tupleToMap(r.b)

      // 补齐 ClickHouse 未返回的 0 值（以结构 map 为基准）
      if (structure?.statementMap) {
        for (const id of Object.keys(structure.statementMap)) {
          if (sMap[id] === undefined) sMap[id] = 0
        }
      }
      if (structure?.fnMap) {
        for (const id of Object.keys(structure.fnMap)) {
          if (fMap[id] === undefined) fMap[id] = 0
        }
      }
      // b 转换为 Istanbul 期望的数组形式
      const bArr = transformFlatBranchHitsToArrays(bFlat, structure?.branchMap)
      result[path] = {
        path,
        ...structure,
        s: sMap,
        f: fMap,
        b: bArr,
      }
    }
    return result
  }

  async getMapForPull({ provider, repoID, pullNumber, buildProvider, buildID, filePath, mode }: { provider: string; repoID: string; pullNumber: string; buildProvider?: string; buildID?: string; filePath?: string; mode?: string }) {
    if (provider !== 'gitlab') return {}

    const baseUrl = (await this.syscfg?.get('system_config.gitlab_base_url')) || process.env.GITLAB_BASE_URL
    const token = (await this.syscfg?.get('git_provider[0].private_token')) || process.env.GITLAB_TOKEN
    if (!baseUrl || !token) {
      return {}
    }

    const projectId = encodeURIComponent(repoID)
    const headers = { 'PRIVATE-TOKEN': token } as Record<string, string>

    const mrResp = await axios.get(`${baseUrl}/api/v4/projects/${projectId}/merge_requests/${pullNumber}`, { headers })
    if (mrResp.status < 200 || mrResp.status >= 300) return {}
    const mr: any = mrResp.data
    const headSha: string | undefined = mr?.diff_refs?.head_sha || mr?.sha
    if (!headSha) return {}

    const commitsResp = await axios.get(`${baseUrl}/api/v4/projects/${projectId}/merge_requests/${pullNumber}/commits`, { headers })
    if (commitsResp.status < 200 || commitsResp.status >= 300) return {}
    const commits: Array<{ id: string }> = commitsResp.data
    if (!Array.isArray(commits) || commits.length === 0) return {}

    const shas = commits.map((c) => c.id)
    const covWhere: any = { provider, repoID: repoID, sha: { $in: shas } } as any
    if (buildProvider) covWhere.buildProvider = buildProvider
    if (buildID) covWhere.buildID = buildID
    const allCov = await this.covRepo!.find(covWhere, { fields: ['id', 'sha', 'instrumentCwd'] })
    if (!allCov?.length) return {}

    const covIds = allCov.map((c: any) => c.id)
    const relWhere: any = { coverageID: { $in: covIds } } as any
    if (filePath) relWhere.filePath = filePath
    const relationsAll = await this.relRepo!.find(relWhere, { fields: ['coverageID', 'coverageMapHashID', 'fullFilePath'] })

    const db = process.env.CLICKHOUSE_DATABASE || 'default'
    const idsList = covIds.map((id) => `'${id.replace(/'/g, "''")}'`).join(',')
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
    `
    const ch = this.ch.getClient()
    const hitRes = await ch.query({ query: hitQuery, format: 'JSONEachRow' })
    const hitRows: Array<{ coverageID: string; fullFilePath: string; s: any; f: any; b: any }> = await hitRes.json()

    const covByID = new Map(allCov.map((c: any) => [c.id, c] as const))
    const baseSet = new Set<string>()
    for (const c of allCov) if (c.sha === headSha) baseSet.add(c.id)
    if (baseSet.size === 0) baseSet.add(allCov[0].id)
    const baselineCovID = [...baseSet][0]
    const baselineCwd = (covByID.get(baselineCovID) as any)?.instrumentCwd || ''

    const changesBySha = new Map<string, Set<string>>()
    if (mode && mode.toLowerCase() !== 'filemerge') {
      for (const c of commits) {
        if (c.id === headSha) continue
        const cmpResp = await axios.get(`${baseUrl}/api/v4/projects/${projectId}/repository/compare`, {
          headers,
          params: { from: c.id, to: headSha },
        })
        if (cmpResp.status < 200 || cmpResp.status >= 300) continue
        const cmp: any = cmpResp.data
        const s = new Set<string>()
        for (const d of cmp?.diffs || []) {
          if (d?.old_path) s.add(d.old_path)
          if (d?.new_path) s.add(d.new_path)
        }
        changesBySha.set(c.id, s)
      }
    }

    const aggregated = new Map<string, { S: Record<string, number>; F: Record<string, number>; B: Record<string, number> }>()
    const ensure = (path: string) => {
      if (!aggregated.has(path)) aggregated.set(path, { S: {}, F: {}, B: {} })
      return aggregated.get(path)!
    }
    const isBlockMerge = (mode || '').toLowerCase() === 'blockmerge'

    const covPathToHash = new Map<string, string>()
    for (const r of relationsAll as any[]) {
      covPathToHash.set(`${r.coverageID}|${r.fullFilePath}`, r.coverageMapHashID)
    }
    const allHashes = Array.from(new Set(relationsAll.map((r: any) => r.coverageMapHashID)))
    const hashToMap = await this.mapStore.fetchCoverageMapsFromClickHouse(allHashes)
    // 为每个绝对路径选取一个结构用于补齐（优先 baseline 覆盖）
    const pathToStructure = new Map<string, any>()
    for (const r of relationsAll as any[]) {
      const struct = hashToMap.get(r.coverageMapHashID)
      if (!struct) continue
      const existing = pathToStructure.get(r.fullFilePath)
      if (!existing || r.coverageID === baselineCovID) {
        pathToStructure.set(r.fullFilePath, struct)
      }
    }

    for (const row of hitRows) {
      const cov = covByID.get(row.coverageID)
      if (!cov) continue
      const isBaseline = baseSet.has(row.coverageID)
      const relPath = trimInstrumentCwd(row.fullFilePath, (cov as any).instrumentCwd || '')
      let include = isBaseline
      if (!isBaseline) {
        const changed = changesBySha.get(cov.sha)
        include = !(changed && changed.has(relPath))
      }
      if (include || !isBlockMerge) {
        const agg = ensure(row.fullFilePath)
        const s = tupleToMap(row.s)
        const f = tupleToMap(row.f)
        const b = tupleToMap(row.b)
        for (const [k, v] of Object.entries(s)) agg.S[k] = (agg.S[k] || 0) + (v as number)
        for (const [k, v] of Object.entries(f)) agg.F[k] = (agg.F[k] || 0) + (v as number)
        for (const [k, v] of Object.entries(b)) agg.B[k] = (agg.B[k] || 0) + (v as number)
        continue
      }
      const baseKey = `${baselineCovID}|${row.fullFilePath}`
      const otherKey = `${row.coverageID}|${row.fullFilePath}`
      const baseHash = covPathToHash.get(baseKey)
      const otherHash = covPathToHash.get(otherKey)
      if (!baseHash || !otherHash) continue
      const baseMap = hashToMap.get(baseHash)
      const otherMap = hashToMap.get(otherHash)
      if (!baseMap || !otherMap) continue

      const baseRel = trimInstrumentCwd(row.fullFilePath, baselineCwd)
      const otherRel = relPath
      const baseContent = await this.git.fetchGitLabFile(baseUrl, projectId, headSha, baseRel, headers).catch(() => '')
      const otherContent = await this.git.fetchGitLabFile(baseUrl, projectId, cov.sha, otherRel, headers).catch(() => '')
      const stmtInc = mergeStatementHitsByBlock(
        baseContent,
        baseMap.statementMap,
        otherContent,
        otherMap.statementMap,
        tupleToMap(row.s)
      )
      const fnInc = mergeFunctionHitsByBlock(
        baseContent,
        baseMap.fnMap,
        otherContent,
        otherMap.fnMap,
        tupleToMap(row.f)
      )
      const agg = ensure(row.fullFilePath)
      for (const [k, v] of Object.entries(stmtInc)) agg.S[k] = (agg.S[k] || 0) + (v as number)
      for (const [k, v] of Object.entries(fnInc)) agg.F[k] = (agg.F[k] || 0) + (v as number)
    }

    const out: Record<string, any> = {}
    for (const [absPath, agg] of aggregated) {
      const path = trimInstrumentCwd(absPath, baselineCwd)
      const struct = pathToStructure.get(absPath)
      const bArr = transformFlatBranchHitsToArrays(agg.B, struct?.branchMap)
      out[path] = { path, s: agg.S, f: agg.F, b: bArr }
    }
    return out
  }
}



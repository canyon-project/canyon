import {Injectable} from "@nestjs/common";
import axios from 'axios'
import {ChService} from "../ch/ch.service";
import {CoverageMapStoreService} from "./coverage.map-store.service";
import {SystemConfigService} from "../system-config/system-config.service";
import {CoverageGitService} from "./coverage.git.service";
import {InjectRepository} from "@mikro-orm/nestjs";
import {CoverageEntity} from "../../entities/coverage.entity";
import {EntityRepository} from "@mikro-orm/core";
import {CoverageMapRelationEntity} from "../../entities/coverage-map-relation.entity";
import { tupleToMap, trimInstrumentCwd } from './coverage.utils'

@Injectable()
export class CoverageOverviewService {
  constructor(
    private readonly ch: ChService,
    private readonly mapStore: CoverageMapStoreService,
    private readonly syscfg: SystemConfigService,
    private readonly git: CoverageGitService,
    @InjectRepository(CoverageEntity) private readonly covRepo: EntityRepository<CoverageEntity>,
    @InjectRepository(CoverageMapRelationEntity) private readonly relRepo: EntityRepository<CoverageMapRelationEntity>
  ) {
  }

  async getOverview(q: any){
    const { provider, repoID, sha, buildProvider, buildID, reportProvider, reportID, filePath } = q ?? {}
    if (!provider || !repoID || !sha) {
      return {
        testCaseInfoList: [],
        buildGroupList: [],
        resultList: [],
      }
    }

    const covWhere: any = { provider, repoID, sha } as any
    if (buildProvider) covWhere.buildProvider = buildProvider
    if (buildID) covWhere.buildID = buildID
    const coverages = await this.covRepo.find(covWhere, { fields: ['id', 'instrumentCwd', 'buildProvider', 'buildID', 'provider', 'reportProvider', 'reportID', 'repoID', 'sha'] })
    if (!coverages?.length) {
      return {
        testCaseInfoList: [],
        buildGroupList: [],
        resultList: [],
      }
    }

    // build groups (dedup)
    const buildGroupSet = new Set<string>()
    const buildGroupList: Array<{ buildProvider: string; buildID: string }> = []
    for (const c of coverages as any[]) {
      const key = `${c.buildProvider || ''}|${c.buildID || ''}`
      if (!buildGroupSet.has(key)) {
        buildGroupSet.add(key)
        buildGroupList.push({ buildProvider: c.buildProvider || '', buildID: c.buildID || '' })
      }
    }

    // relations for files
    const coverageIDs = (coverages as any[]).map((c) => c.id)
    const relWhere: any = { coverageID: { $in: coverageIDs } } as any
    relWhere.filePath = /^(?!dist).*/
    if (filePath) relWhere.filePath = filePath
    const relationsAll = await this.relRepo.find(relWhere, { fields: ['coverageMapHashID', 'fullFilePath'] })
    const pathToHash = new Map<string, string>()
    for (const r of relationsAll as any[]) {
      if (!pathToHash.has(r.fullFilePath)) pathToHash.set(r.fullFilePath, r.coverageMapHashID)
    }
    const allHashes = Array.from(new Set(Array.from(pathToHash.values())))
    const hashToMap = await this.mapStore.fetchCoverageMapsFromClickHouse(allHashes)

    // select coverages for hit aggregation by report filter
    const selected = (coverages as any[]).filter((c) => {
      const rpOK = !reportProvider || c.reportProvider === reportProvider
      const ridOK = !reportID || c.reportID === reportID
      return rpOK && ridOK
    })
    const selectedIDs = selected.map((c) => `'${String(c.id).replace(/'/g, "''")}'`).join(',')
    const db = process.env.CLICKHOUSE_DATABASE || 'default'
    // 命中数据（带 coverage_id，供分组过滤）
    const hitQuery = `
      SELECT
        coverage_id as coverageID,
        full_file_path as fullFilePath,
        sumMapMerge(s) as s
      FROM ${db}.coverage_hit_agg
      WHERE coverage_id IN (${selectedIDs || "''"})
      ${filePath ? ` AND endsWith(full_file_path, '${String(filePath).replace(/'/g, "''")}')` : ''}
      GROUP BY coverage_id, full_file_path
    `
    const ch = this.ch.getClient()
    const hitRes = await ch.query({ query: hitQuery, format: 'JSONEachRow' })
    const coverageHitData: Array<{ coverageID: string; fullFilePath: string; s: any }> = await hitRes.json()

    // 为每个 fullFilePath + hash 选择结构，用于计算总语句数（分母）
    const instrumentCwd = (coverages[0] as any)?.instrumentCwd || ''
    const trimPath = (p: string) => trimInstrumentCwd(p, instrumentCwd)
    const seenPair = new Set<string>()
    const coverageMapWithFilePath: Array<{ fullFilePath: string; hash: string; S: Record<string, true> }> = []
    for (const r of relationsAll as any[]) {
      const key = `${r.fullFilePath}::${r.coverageMapHashID}`
      if (seenPair.has(key)) continue
      seenPair.add(key)
      const struct = hashToMap.get(r.coverageMapHashID)
      const sKeys = struct ? Object.keys(struct.statementMap || {}) : []
      const S: Record<string, true> = {}
      for (const k of sKeys) S[String(k)] = true
      coverageMapWithFilePath.push({ fullFilePath: r.fullFilePath, hash: r.coverageMapHashID, S })
    }

    // 去重构建组
    const dedupSet = new Set<string>()
    const deduplicatedBuildGroupList: Array<{ buildProvider: string; buildID: string }> = []
    for (const g of buildGroupList) {
      const k = `${g.buildProvider}|${g.buildID}`
      if (!dedupSet.has(k)) dedupSet.add(k), deduplicatedBuildGroupList.push(g)
    }

    // 拉取测试用例信息列表（仅 mpaas/flytest，按 (reportProvider, reportID) 去重并并发请求）
    const testCaseInfoList = await this._getTestCaseInfoList(coverages as any[])
    const resultList = this._buildResultList(
      deduplicatedBuildGroupList,
      coverages as any[],
      coverageHitData,
      coverageMapWithFilePath,
      testCaseInfoList,
    )

    return { testCaseInfoList, buildGroupList: deduplicatedBuildGroupList, resultList }
  }

  private _calcCoverageSummary(
    coverageHit: Array<{ fullFilePath: string; s: any }>,
    coverageMap: Array<{ fullFilePath: string; S: Record<string, true> }>,
  ) {
    const hitMap = new Map<string, Set<string>>()
    for (const h of coverageHit) {
      const path = h.fullFilePath
      if (!hitMap.has(path)) hitMap.set(path, new Set<string>())
      const s = tupleToMap(h.s)
      for (const k of Object.keys(s)) hitMap.get(path)!.add(String(k))
    }
    let covered = 0
    for (const set of hitMap.values()) covered += set.size
    let total = 0
    for (const m of coverageMap) total += Object.keys(m.S || {}).length
    const percent = total > 0 ? Math.round((covered / total) * 10000) / 100 : 0
    return { total, covered, percent }
  }

  private _filterCoverageHit(
    coverageList: Array<{ id: string }>,
    coverageHitData: Array<{ coverageID: string; fullFilePath: string; s: any }>,
  ) {
    const set = new Set(coverageList.map((c) => c.id))
    return coverageHitData.filter((h) => set.has(h.coverageID))
  }

  private _extractPathsFromHits(hits: Array<{ fullFilePath: string }>) {
    const set = new Set<string>()
    for (const h of hits) set.add(h.fullFilePath)
    return set
  }

  private _filterCoverageMapWithFilePathByPaths(
    paths: Set<string>,
    coverageMapWithFilePath: Array<{ fullFilePath: string; hash: string; S: Record<string, true> }>,
  ) {
    if (!paths || paths.size === 0) return [] as Array<{ fullFilePath: string; hash: string; S: Record<string, true> }>
    const seen = new Set<string>()
    const out: Array<{ fullFilePath: string; hash: string; S: Record<string, true> }>= []
    for (const m of coverageMapWithFilePath) {
      if (!paths.has(m.fullFilePath)) continue
      const key = `${m.fullFilePath}::${m.hash}`
      if (seen.has(key)) continue
      seen.add(key)
      out.push(m)
    }
    return out
  }

  private _buildAutoMode(
    coverageList: any[],
    coverageHitData: Array<{ coverageID: string; fullFilePath: string; s: any }>,
    coverageMapWithFilePath: Array<{ fullFilePath: string; hash: string; S: Record<string, true> }>,
    testCaseInfoList: any[],
  ) {
    const autoCoverages = coverageList.filter((c) => c.reportProvider === 'mpaas' || c.reportProvider === 'flytest')
    const hits = this._filterCoverageHit(autoCoverages, coverageHitData)
    const paths = this._extractPathsFromHits(hits)
    const maps = this._filterCoverageMapWithFilePathByPaths(paths, coverageMapWithFilePath)
    const summary = this._calcCoverageSummary(hits, maps)
    const caseList = this._buildCaseList(autoCoverages, coverageHitData, coverageMapWithFilePath, testCaseInfoList)
    return { mode: 'auto', summary, caseList }
  }

  private _buildManualMode(
    coverageList: any[],
    coverageHitData: Array<{ coverageID: string; fullFilePath: string; s: any }>,
    coverageMapWithFilePath: Array<{ fullFilePath: string; hash: string; S: Record<string, true> }>,
    testCaseInfoList: any[],
  ) {
    const manualCoverages = coverageList.filter((c) => c.reportProvider === 'person')
    const hits = this._filterCoverageHit(manualCoverages, coverageHitData)
    const paths = this._extractPathsFromHits(hits)
    const maps = this._filterCoverageMapWithFilePathByPaths(paths, coverageMapWithFilePath)
    const summary = this._calcCoverageSummary(hits, maps)
    const caseList = this._buildCaseList(manualCoverages, coverageHitData, coverageMapWithFilePath, testCaseInfoList)
    return { mode: 'manual', summary, caseList }
  }

  private _buildCaseList(
    coverageList: any[],
    coverageHitData: Array<{ coverageID: string; fullFilePath: string; s: any }>,
    coverageMapWithFilePath: Array<{ fullFilePath: string; hash: string; S: Record<string, true> }>,
    testCaseInfoList: any[],
  ) {
    const out: any[] = []
    for (const c of coverageList) {
      const singleHits = this._filterCoverageHit([c], coverageHitData)
      const paths = this._extractPathsFromHits(singleHits)
      const maps = this._filterCoverageMapWithFilePathByPaths(paths, coverageMapWithFilePath)
      const summary = this._calcCoverageSummary(singleHits, maps)
      const testCaseInfo = this._getTestCaseInfo(testCaseInfoList, c.reportID, c.reportProvider)
      const item: any = {
        id: c.id,
        repoID: c.repoID,
        sha: c.sha,
        buildProvider: c.buildProvider,
        buildID: c.buildID,
        reportProvider: c.reportProvider,
        reportID: c.reportID,
        summary,
      }
      for (const [k, v] of Object.entries(testCaseInfo || {})) (item as any)[k] = v
      out.push(item)
    }
    return out
  }

  private _getTestCaseInfo(list: any[], reportID?: string, reportProvider?: string) {
    for (const item of list || []) {
      if (item && typeof item === 'object') {
        if ((item as any).reportID === reportID && (item as any).reportProvider === reportProvider) {
          return item as any
        }
      }
    }
    return {
      caseName: reportID,
      passedCount: 0,
      failedCount: 0,
      totalCount: 0,
      passRate: '100%',
      reportProvider,
      reportID,
    }
  }

  private _buildResultList(
    deduplicatedBuildGroupList: Array<{ buildProvider: string; buildID: string }>,
    coverageList: any[],
    coverageHitData: Array<{ coverageID: string; fullFilePath: string; s: any }>,
    coverageMapWithFilePath: Array<{ fullFilePath: string; hash: string; S: Record<string, true> }>,
    testCaseInfoList: any[],
  ) {
    const resultList: any[] = []
    for (const group of deduplicatedBuildGroupList) {
      const { buildProvider, buildID } = group
      const current = coverageList.filter((c) => c.buildProvider === buildProvider && c.buildID === buildID)
      const hits = this._filterCoverageHit(current, coverageHitData)
      const paths = this._extractPathsFromHits(hits)
      const maps = this._filterCoverageMapWithFilePathByPaths(paths, coverageMapWithFilePath)
      const summary = this._calcCoverageSummary(hits, maps)
      const modeList = [
        this._buildAutoMode(current, coverageHitData, coverageMapWithFilePath, testCaseInfoList),
        this._buildManualMode(current, coverageHitData, coverageMapWithFilePath, testCaseInfoList),
      ]
      resultList.push({ buildID, buildProvider, summary, modeList })
    }
    return resultList
  }

  private async _getTestCaseInfoList(coverageList: Array<{ reportProvider?: string | null; reportID?: string | null }>): Promise<any[]> {
    const need = (coverageList || []).filter((c) => c.reportProvider === 'mpaas' || c.reportProvider === 'flytest')
    type Pair = { provider: string; id: string }
    const seen = new Set<string>()
    const pairs: Pair[] = []
    for (const c of need) {
      const provider = String(c.reportProvider || '')
      const id = String(c.reportID || '')
      if (!provider || !id) continue
      const key = `${provider}|${id}`
      if (seen.has(key)) continue
      seen.add(key)
      pairs.push({ provider, id })
    }

    const base = await this._getTestCaseBaseURL()
    const tasks = pairs.map((p) => this._fetchExternalTestCaseInfo(base, p.provider, p.id))
    const results = await Promise.all(tasks.map((t) => t.catch(() => null)))
    return results.filter(Boolean) as any[]
  }

  private async _getTestCaseBaseURL(): Promise<string> {
    const cfg = (await this.syscfg?.get('system_config.test_case_url')) || process.env.TEST_CASE_BASE_URL
    return cfg || 'http://test-case.com/report'
  }

  private async _fetchExternalTestCaseInfo(base: string, reportProvider: string, reportID: string): Promise<any> {
    const params = new URLSearchParams()
    params.set('report_provider', reportProvider)
    params.set('report_id', reportID)
    const url = `${base}?${params.toString()}`

    const def = {
      caseName: reportID,
      passedCount: 0,
      failedCount: 0,
      totalCount: 0,
      passRate: '100.00%',
      reportProvider,
      reportID,
      caseUrl: '',
    }
    try {
      const resp = await axios.get(url, { timeout: 10000 })
      if (!resp || resp.status < 200 || resp.status >= 300) return def
      const body = (resp.data || {}) as any
      const getNum = (...keys: string[]) => {
        for (const k of keys) {
          const v = body?.[k]
          if (typeof v === 'number') return v
          if (typeof v === 'string') {
            const n = Number(v)
            if (!Number.isNaN(n)) return n
          }
        }
        return 0
      }
      const getStr = (...keys: string[]) => {
        for (const k of keys) {
          const v = body?.[k]
          if (typeof v === 'string' && v) return v
        }
        return ''
      }
      const caseName = getStr('caseName', 'name', 'title') || reportID
      const passed = getNum('passed', 'pass', 'passedCount')
      const failed = getNum('failed', 'fail', 'failedCount')
      let total = getNum('total', 'totalCount')
      if (!total) total = passed + failed
      let passRate = getStr('passRate')
      if (!passRate) {
        const r = total > 0 ? (passed / total) * 100 : 100
        passRate = `${r.toFixed(2)}%`
      }
      const caseUrl = getStr('caseUrl')
      return {
        caseName,
        passedCount: Number(passed || 0),
        failedCount: Number(failed || 0),
        totalCount: Number(total || 0),
        passRate,
        reportProvider,
        reportID,
        caseUrl: caseUrl || '',
      }
    } catch {
      return def
    }
  }

}

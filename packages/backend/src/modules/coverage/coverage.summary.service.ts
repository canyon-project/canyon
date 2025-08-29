import { BadRequestException, Injectable } from '@nestjs/common'
import axios from 'axios'
import { EntityRepository } from '@mikro-orm/core'
import { InjectRepository } from '@mikro-orm/nestjs'
import { CoverageEntity } from '../../entities/coverage.entity'
import { CoverageMapRelationEntity } from '../../entities/coverage-map-relation.entity'
import { ChService } from '../ch/ch.service'
import { tupleToMap, trimInstrumentCwd, mergeStatementHitsByBlock, mergeFunctionHitsByBlock } from './coverage.utils'
import { CoverageMapStoreService } from './coverage.map-store.service'
import { SystemConfigService } from '../system-config/system-config.service'
import { CoverageGitService } from './coverage.git.service'

@Injectable()
export class CoverageSummaryService {
  constructor(
    private readonly ch: ChService,
    private readonly mapStore: CoverageMapStoreService,
    private readonly syscfg: SystemConfigService,
    private readonly git: CoverageGitService,
    @InjectRepository(CoverageEntity) private readonly covRepo: EntityRepository<CoverageEntity>,
    @InjectRepository(CoverageMapRelationEntity) private readonly relRepo: EntityRepository<CoverageMapRelationEntity>
  ) {}

  async getSummaryMap(q: any) {
    const { subject, subjectID, provider, repoID, buildProvider, buildID, mode } = q ?? {}
    if (!provider || !repoID || !subject || !subjectID) {
      throw new BadRequestException('provider, repoID, subject, subjectID are required')
    }
    if (!buildProvider || !buildID) {
      throw new BadRequestException('buildProvider, buildID are required')
    }

    if (subject === 'commit' || subject === 'commits') {
      const qb: any = { provider, repoID, sha: subjectID } as any
      if (buildProvider) qb.buildProvider = buildProvider
      if (buildID) qb.buildID = buildID
      const coverages = await this.covRepo.find(qb, { fields: ['id', 'instrumentCwd'] })
      if (!coverages.length) return {}
      const coverageIDs = coverages.map((c) => c.id)
      const idsList = coverageIDs.map((id) => `'${id.replace(/'/g, "''")}'`).join(',')
      const hitQuery = `
        SELECT
          full_file_path as fullFilePath,
          sumMapMerge(s) as s,
          sumMapMerge(f) as f,
          sumMapMerge(b) as b
        FROM coverage_hit_agg
        WHERE coverage_id IN (${idsList})
        GROUP BY full_file_path
      `
      const ch = this.ch.getClient()
      const hitRes = await ch.query({ query: hitQuery, format: 'JSONEachRow' })
      const rows: Array<{ fullFilePath: string; s: any; f: any; b: any }> = await hitRes.json()

      const instrumentCwd = (coverages[0] as any)?.instrumentCwd || ''
      const relWhere: any = { coverageID: { $in: coverageIDs } } as any
      relWhere.filePath = /^(?!dist).*/
      const relationsAll = await this.relRepo.find(relWhere, { fields: ['coverageMapHashID', 'fullFilePath'] })
      const pathToHash = new Map<string, string>()
      for (const r of relationsAll as any[]) {
        if (!pathToHash.has(r.fullFilePath)) pathToHash.set(r.fullFilePath, r.coverageMapHashID)
      }
      const allHashes = Array.from(new Set(Array.from(pathToHash.values())))
      const hashToMap = await this.mapStore.fetchCoverageMapsFromClickHouse(allHashes)

      const result: Record<string, any> = {}
      for (const r of rows || []) {
        const rel = trimInstrumentCwd(r.fullFilePath, instrumentCwd)
        const hash = pathToHash.get(r.fullFilePath)
        if (hash){

          const structure = hash ? hashToMap.get(hash) : undefined
          const sMap = tupleToMap(r.s)
          const fMap = tupleToMap(r.f)
          const bMap = tupleToMap(r.b)

          const totalStatements = structure ? Object.keys(structure.statementMap || {}).length : Object.keys(sMap).length
          const coveredStatements = Object.values(sMap).reduce((a: number, v: any) => a + (Number(v) > 0 ? 1 : 0), 0)
          const totalFunctions = structure ? Object.keys(structure.fnMap || {}).length : Object.keys(fMap).length
          const coveredFunctions = Object.values(fMap).reduce((a: number, v: any) => a + (Number(v) > 0 ? 1 : 0), 0)
          const totalBranches = structure
            ? Object.values(structure.branchMap || {}).reduce((a: number, v: any) => a + (Array.isArray((v as any).locations) ? (v as any).locations.length : 0), 0)
            : Object.keys(bMap).length
          const coveredBranches = Object.values(bMap).reduce((a: number, v: any) => a + (Number(v) > 0 ? 1 : 0), 0)

          result[rel] = {
            path: rel,
            statements: { total: totalStatements, covered: coveredStatements, pct: 0 },
            functions: { total: totalFunctions, covered: coveredFunctions, pct: 0 },
            branches: { total: totalBranches, covered: coveredBranches, pct: 0 },
            newlines: { total: 0, covered: 0, pct: 0 },
          }
        }
      }
      return result
    }
    throw new BadRequestException('invalid subject')
  }
}



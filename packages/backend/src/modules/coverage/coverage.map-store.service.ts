import { Injectable } from '@nestjs/common'
import { ChService } from '../ch/ch.service'

@Injectable()
export class CoverageMapStoreService {
  constructor(private readonly ch: ChService) {}

  async fetchCoverageMapsFromClickHouse(hashList: string[]) {
    const out = new Map<
      string,
      {
        statementMap: Record<string, any>
        fnMap: Record<string, any>
        branchMap: Record<string, any>
      }
    >()
    if (hashList.length === 0) return out
    const hashes = hashList.map((h) => `'${h.replace(/'/g, "''")}'`).join(',')
    const query = `
      SELECT
        statement_map as statementMap,
        fn_map as fnMap,
        branch_map as branchMap,
        hash as coverageMapHashID
      FROM coverage_map
      WHERE hash IN (${hashes})
    `
    const res = await this.ch
      .getClient()
      .query({ query, format: 'JSONEachRow' })
    const rows: Array<{
      statementMap: Record<string, any>
      fnMap: Record<string, any>
      branchMap: Record<string, any>
      coverageMapHashID: string
    }> = await res.json()
    for (const r of rows) {
      const normalizedStmt: Record<string, any> = {}
      const srcStmt = r.statementMap || {}
      for (const [id, tuple] of Object.entries(srcStmt)) {
        const arr = Array.isArray(tuple) ? (tuple as any[]) : []
        const start_line = Number(arr[0] ?? 0)
        const start_column = Number(arr[1] ?? 0)
        const end_line = Number(arr[2] ?? 0)
        const end_column = Number(arr[3] ?? 0)
        normalizedStmt[id] = {
          start: { line: start_line, column: start_column },
          end: { line: end_line, column: end_column },
        }
      }

      const normalizedFn: Record<string, any> = {}
      const srcFn = r.fnMap || {}
      for (const [id, tuple] of Object.entries(srcFn)) {
        const arr = Array.isArray(tuple) ? (tuple as any[]) : []
        const name = String(arr[0] ?? '')
        const line = Number(arr[1] ?? 0)
        const startPos = Array.isArray(arr[2]) ? (arr[2] as any[]) : []
        const endPos = Array.isArray(arr[3]) ? (arr[3] as any[]) : []
        const s0 = Number(startPos[0] ?? 0)
        const s1 = Number(startPos[1] ?? 0)
        const e0 = Number(endPos[0] ?? 0)
        const e1 = Number(endPos[1] ?? 0)
        normalizedFn[id] = {
          name,
          decl: {
            start: { line: s0, column: s1 },
            end: { line: s0, column: s1 },
          },
          loc: {
            start: { line: s0, column: s1 },
            end: { line: e0, column: e1 },
          },
          line,
        }
      }

      const normalizedBranch: Record<string, any> = {}
      const srcBranch = r.branchMap || {}
      for (const [id, tuple] of Object.entries(srcBranch)) {
        const arr = Array.isArray(tuple) ? (tuple as any[]) : []
        const typeNum = Number(arr[0] ?? 0)
        const line = Number(arr[1] ?? 0)
        const posArr = Array.isArray(arr[2]) ? (arr[2] as any[]) : []
        const p0 = Number(posArr[0] ?? 0)
        const p1 = Number(posArr[1] ?? 0)
        const p2 = Number(posArr[2] ?? 0)
        const p3 = Number(posArr[3] ?? 0)
        const pathsArr = Array.isArray(arr[3]) ? (arr[3] as any[]) : []
        const locations: Array<{
          start: { line: number; column: number }
          end: { line: number; column: number }
        }> = []
        for (const p of pathsArr) {
          const pa = Array.isArray(p) ? (p as any[]) : []
          const q0 = Number(pa[0] ?? 0)
          const q1 = Number(pa[1] ?? 0)
          const q2 = Number(pa[2] ?? 0)
          const q3 = Number(pa[3] ?? 0)
          locations.push({
            start: { line: q0, column: q1 },
            end: { line: q2, column: q3 },
          })
        }
        const typeStr =
          typeNum === 0
            ? 'if'
            : typeNum === 1
              ? 'switch'
              : typeNum === 2
                ? 'cond-expr'
                : typeNum === 3
                  ? 'binary-expr'
                  : 'unknown'
        normalizedBranch[id] = {
          loc: {
            start: { line: p0, column: p1 },
            end: { line: p2, column: p3 },
          },
          type: typeStr,
          locations,
          line,
        }
      }

      out.set(r.coverageMapHashID, {
        statementMap: normalizedStmt,
        fnMap: normalizedFn,
        branchMap: normalizedBranch,
      })
    }
    return out
  }
}

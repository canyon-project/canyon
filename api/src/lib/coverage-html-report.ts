import { readFileSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import libCoverage, { type CoverageMapData } from 'istanbul-lib-coverage'
import libReport from 'istanbul-lib-report'
import reports from 'istanbul-reports'

export type IstanbulCoverageMap = Record<string, Record<string, unknown>>

/** 将 CI 绝对路径覆盖率 key 收敛为相对 instrumentCwd 的路径，便于对照源码 */
export function remapCoveragePaths(
  istanbul: IstanbulCoverageMap,
  instrumentCwd: string,
): IstanbulCoverageMap {
  const prefix = instrumentCwd.replace(/\/+$/, '')
  const out: IstanbulCoverageMap = {}

  for (const [filePath, entry] of Object.entries(istanbul)) {
    let rel = filePath
    if (prefix && (filePath === prefix || filePath.startsWith(prefix + '/'))) {
      rel = filePath.slice(prefix.length).replace(/^\//, '')
    }
    if (!rel) rel = filePath
    out[rel] = {
      ...entry,
      path: rel,
      // 兜底：保证 html 生成前结构完整
      statementMap: entry.statementMap ?? {},
      fnMap: entry.fnMap ?? {},
      branchMap: entry.branchMap ?? {},
      s: entry.s ?? {},
      f: entry.f ?? {},
      b: entry.b ?? {},
    }
  }

  return out
}

function createSourceFinder(sourceRoot: string): (filePath: string) => string {
  return (filePath: string) => {
    const candidates = [
      path.join(sourceRoot, filePath),
      path.resolve(sourceRoot, filePath),
    ]

    for (const candidate of candidates) {
      try {
        if (candidate.startsWith(sourceRoot)) {
          return readFileSync(candidate, 'utf8')
        }
      } catch {
        // try next
      }
    }

    // 回退：用路径后缀在常见层级下再试一次（简单版）
    const normalized = filePath.replace(/^\/+/, '')
    try {
      return readFileSync(path.join(sourceRoot, normalized), 'utf8')
    } catch {
      throw new Error(`Unable to lookup source: ${filePath} (root=${sourceRoot})`)
    }
  }
}

/**
 * 用解压后的源码树 + Istanbul coverage 生成 html 报告到 outputDir
 */
export async function generateIstanbulHtmlReport(args: {
  istanbul: IstanbulCoverageMap
  instrumentCwd: string
  sourceRoot: string
  outputDir: string
}): Promise<{ reportDir: string; indexPath: string }> {
  const remapped = remapCoveragePaths(args.istanbul, args.instrumentCwd)
  await mkdir(args.outputDir, { recursive: true })

  const coverageMap = libCoverage.createCoverageMap(remapped as unknown as CoverageMapData)
  const context = libReport.createContext({
    dir: args.outputDir,
    defaultSummarizer: 'nested',
    coverageMap,
    sourceFinder: createSourceFinder(args.sourceRoot),
    watermarks: {
      statements: [50, 80],
      functions: [50, 80],
      branches: [50, 80],
      lines: [50, 80],
    },
  })

  const report = reports.create('html', {
    skipEmpty: false,
  })
  report.execute(context)

  return {
    reportDir: args.outputDir,
    indexPath: path.join(args.outputDir, 'index.html'),
  }
}

export function snapshotPublicReportDir(snapshotId: number): string {
  return path.resolve(process.cwd(), 'public', 'snapshots', String(snapshotId))
}

export function snapshotPublicReportUrl(snapshotId: number): string {
  return `/snapshots/${snapshotId}/index.html`
}

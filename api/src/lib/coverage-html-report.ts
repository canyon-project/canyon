import { readFileSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import libCoverage, { type CoverageMap, type CoverageMapData } from 'istanbul-lib-coverage'
import libReport from 'istanbul-lib-report'
import libSourceMaps from 'istanbul-lib-source-maps'
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
      // 兜底：保证 html 生成前结构完整；保留 inputSourceMap 供后续 remap
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

function createDiskSourceFinder(sourceRoot: string): (filePath: string) => string {
  return (filePath: string) => {
    const candidates = [
      path.join(sourceRoot, filePath),
      path.resolve(sourceRoot, filePath),
      path.join(sourceRoot, filePath.replace(/^\/+/, '')),
    ]

    for (const candidate of candidates) {
      try {
        const normalizedRoot = path.resolve(sourceRoot)
        if (path.resolve(candidate).startsWith(normalizedRoot)) {
          return readFileSync(candidate, 'utf8')
        }
      } catch {
        // try next
      }
    }

    throw new Error(`Unable to lookup source: ${filePath} (root=${sourceRoot})`)
  }
}

function coverageHasInputSourceMap(coverageMap: CoverageMap): boolean {
  return coverageMap.files().some((file) => {
    const data = coverageMap.fileCoverageFor(file).data as { inputSourceMap?: unknown }
    return Boolean(data.inputSourceMap)
  })
}

/**
 * 若 coverage 带 inputSourceMap，用 istanbul-lib-source-maps 还原到原始文件。
 * 返回 remap 后的 CoverageMap，以及优先读 sourcemap sourcesContent 的 sourceFinder。
 */
async function maybeTransformWithInputSourceMaps(coverageMap: CoverageMap): Promise<{
  coverageMap: CoverageMap
  sourceFinderFromMaps: ((filePath: string) => string) | null
}> {
  if (!coverageHasInputSourceMap(coverageMap)) {
    return { coverageMap, sourceFinderFromMaps: null }
  }

  const store = libSourceMaps.createSourceMapStore()
  const transformed = await store.transformCoverage(coverageMap)
  return {
    coverageMap: transformed,
    sourceFinderFromMaps: (filePath: string) => store.sourceFinder(filePath),
  }
}

function combineSourceFinders(
  primary: ((filePath: string) => string) | null,
  fallback: (filePath: string) => string,
): (filePath: string) => string {
  return (filePath: string) => {
    if (primary) {
      try {
        const content = primary(filePath)
        if (typeof content === 'string') return content
      } catch {
        // fall through to disk
      }
    }
    return fallback(filePath)
  }
}

/**
 * 用解压后的源码树 + Istanbul coverage 生成 html 报告到 outputDir。
 * 有 inputSourceMap 时先走 istanbul-lib-source-maps.transformCoverage。
 */
export async function generateIstanbulHtmlReport(args: {
  istanbul: IstanbulCoverageMap
  instrumentCwd: string
  sourceRoot: string
  outputDir: string
}): Promise<{ reportDir: string; indexPath: string }> {
  const prepared = remapCoveragePaths(args.istanbul, args.instrumentCwd)
  await mkdir(args.outputDir, { recursive: true })

  const rawMap = libCoverage.createCoverageMap(prepared as unknown as CoverageMapData)
  const { coverageMap, sourceFinderFromMaps } =
    await maybeTransformWithInputSourceMaps(rawMap)

  const context = libReport.createContext({
    dir: args.outputDir,
    defaultSummarizer: 'nested',
    coverageMap,
    sourceFinder: combineSourceFinders(
      sourceFinderFromMaps,
      createDiskSourceFinder(args.sourceRoot),
    ),
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

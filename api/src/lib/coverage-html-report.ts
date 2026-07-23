import { readFileSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import libCoverage, { type CoverageMap, type CoverageMapData } from 'istanbul-lib-coverage'
import libReport from 'istanbul-lib-report'
import libSourceMaps from 'istanbul-lib-source-maps'
import reports from 'istanbul-reports'

export type IstanbulCoverageMap = Record<string, Record<string, unknown>>

/** 补齐 Istanbul 必填字段，不改路径（供 source-maps remap 使用原始 path） */
function ensureCoverageShape(istanbul: IstanbulCoverageMap): IstanbulCoverageMap {
  const out: IstanbulCoverageMap = {}
  for (const [filePath, entry] of Object.entries(istanbul)) {
    out[filePath] = {
      ...entry,
      path: typeof entry.path === 'string' ? entry.path : filePath,
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

/** 将路径收敛为相对 instrumentCwd（应在 source-maps remap 之后调用） */
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

/** 路径替换后过滤：去掉 dist 开头的产物文件 */
export function filterOutDistPaths(istanbul: IstanbulCoverageMap): IstanbulCoverageMap {
  const out: IstanbulCoverageMap = {}
  for (const [filePath, entry] of Object.entries(istanbul)) {
    const normalized = filePath.replace(/^\/+/, '')
    if (normalized === 'dist' || normalized.startsWith('dist/')) continue
    out[filePath] = entry
  }
  return out
}

function coverageMapToPlain(coverageMap: CoverageMap): IstanbulCoverageMap {
  return coverageMap.toJSON() as unknown as IstanbulCoverageMap
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
 * 用两个源码树 + Istanbul coverage 生成 html 报告到 outputDir。
 * 顺序：补齐字段 → source-maps remap → instrumentCwd 路径替换 → 过滤 dist → 出 HTML。
 */
export async function generateIstanbulHtmlReport(args: {
  istanbul: IstanbulCoverageMap
  instrumentCwd: string
  sourceRoot: string
  outputDir: string
}): Promise<{ reportDir: string; indexPath: string }> {
  await mkdir(args.outputDir, { recursive: true })

  // 1) 保持原始 path，先给 source-maps 用
  const shaped = ensureCoverageShape(args.istanbul)
  const rawMap = libCoverage.createCoverageMap(shaped as unknown as CoverageMapData)

  // 2) inputSourceMap → 原始文件
  const { coverageMap: transformedMap, sourceFinderFromMaps } =
    await maybeTransformWithInputSourceMaps(rawMap)

  // 3) source-maps remap 之后再替换 instrumentCwd 前缀
  const pathRemapped = remapCoveragePaths(
    coverageMapToPlain(transformedMap),
    args.instrumentCwd,
  )
  // 4) 过滤 dist 开头的路径
  const filtered = filterOutDistPaths(pathRemapped)
  const coverageMap = libCoverage.createCoverageMap(
    filtered as unknown as CoverageMapData,
  )

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

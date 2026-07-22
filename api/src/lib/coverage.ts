export type CoverageEntry = {
  path?: string
  s?: Record<string, number>
  f?: Record<string, number>
  b?: Record<string, number[]>
  buildHash?: string
  sha?: string
  provider?: string
  repoID?: string
  instrumentCwd?: string
  buildTarget?: string
  contentHash?: string
  statementMap?: unknown
  fnMap?: unknown
  branchMap?: unknown
  inputSourceMap?: unknown
}

export type CoverageMap = Record<string, CoverageEntry>

export function isCoverageEntry(value: unknown): value is CoverageEntry {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const entry = value as Record<string, unknown>
  return (
    's' in entry ||
    'f' in entry ||
    'b' in entry ||
    'buildHash' in entry ||
    'statementMap' in entry
  )
}

/** 支持 `{ coverage, scene }` 或裸 coverage map */
export function normalizeClientBody(body: unknown): {
  coverage: CoverageMap
  scene: Record<string, unknown>
} {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('invalid body')
  }

  const obj = body as Record<string, unknown>
  const maybeCoverage = obj.coverage

  if (maybeCoverage && typeof maybeCoverage === 'object' && !Array.isArray(maybeCoverage)) {
    const first = Object.values(maybeCoverage as CoverageMap)[0]
    if (isCoverageEntry(first)) {
      const scene =
        obj.scene && typeof obj.scene === 'object' && !Array.isArray(obj.scene)
          ? (obj.scene as Record<string, unknown>)
          : {}
      return { coverage: maybeCoverage as CoverageMap, scene }
    }
  }

  const first = Object.values(obj)[0]
  if (isCoverageEntry(first)) {
    return { coverage: obj as CoverageMap, scene: {} }
  }

  throw new Error('invalid coverage payload')
}

export function filterCoverageEntriesWithBuildHash(coverage: CoverageMap): CoverageMap {
  return Object.fromEntries(
    Object.entries(coverage).filter(
      ([, item]) => typeof item?.buildHash === 'string' && item.buildHash.length > 0,
    ),
  )
}

/** 过滤 s 全为 0 或缺少有效 s 的文件 */
export function filterInvalidCoverageFiles(coverage: CoverageMap): {
  filteredCoverage: CoverageMap
  totalFiles: number
  filteredFiles: number
  remainingFiles: number
} {
  const filteredCoverage: CoverageMap = {}
  let totalFiles = 0
  let filteredFiles = 0

  for (const [filePath, fileCoverage] of Object.entries(coverage)) {
    totalFiles++
    const s = fileCoverage?.s
    if (!s || typeof s !== 'object' || Array.isArray(s)) {
      filteredFiles++
      continue
    }
    const sValues = Object.values(s)
    if (sValues.length === 0 || sValues.every((v) => v === 0 || v == null)) {
      filteredFiles++
      continue
    }
    filteredCoverage[filePath] = fileCoverage
  }

  return {
    filteredCoverage,
    totalFiles,
    filteredFiles,
    remainingFiles: totalFiles - filteredFiles,
  }
}

export function firstBuildHashInCoverage(coverage: CoverageMap): string | undefined {
  for (const entry of Object.values(coverage)) {
    if (typeof entry.buildHash === 'string' && entry.buildHash.length > 0) {
      return entry.buildHash
    }
  }
  return undefined
}

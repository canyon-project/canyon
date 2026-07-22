import type { CoverageHit, CoverageMapRelation } from '@prisma/client'
import { prisma } from '../db/index.js'
import {
  addBranchHitMaps,
  addMaps,
  ensureBranchHitMap,
  ensureNumMap,
  type BranchHitMap,
  type NumMap,
} from './coverage-merge.js'
import { decodeCompressedObject } from './hash.js'

type HitAgg = { s: NumMap; f: NumMap; b: BranchHitMap }

/** scene 过滤：filter 中每个字段都要与 scene 相等；{} 匹配全部 */
export function sceneMatches(
  scene: unknown,
  filter: Record<string, unknown>,
): boolean {
  if (!filter || Object.keys(filter).length === 0) return true
  if (!scene || typeof scene !== 'object' || Array.isArray(scene)) return false
  const obj = scene as Record<string, unknown>
  for (const [key, value] of Object.entries(filter)) {
    if (obj[key] !== value) return false
  }
  return true
}

function mergeHitInto(target: HitAgg, hit: Pick<CoverageHit, 's' | 'f' | 'b'>) {
  target.s = addMaps(target.s, ensureNumMap(hit.s))
  target.f = addMaps(target.f, ensureNumMap(hit.f))
  target.b = addBranchHitMaps(target.b, ensureBranchHitMap(hit.b))
}

/**
 * 按 sceneKey + rawFilePath 聚合 hit，写回一张紧凑行并删除旧行。
 * 返回聚合后的 hit（仍按 sceneKey 分组）。
 */
export async function compactHitsByScene(
  buildHash: string,
  sceneKeys: string[],
  freezeTime: Date,
): Promise<CoverageHit[]> {
  if (sceneKeys.length === 0) return []

  const hits = await prisma.coverageHit.findMany({
    where: {
      buildHash,
      sceneKey: { in: sceneKeys },
      createdAt: { lte: freezeTime },
    },
  })
  if (hits.length === 0) return []

  // sceneKey -> rawFilePath -> agg
  const grouped = new Map<string, Map<string, HitAgg>>()
  for (const hit of hits) {
    let byFile = grouped.get(hit.sceneKey)
    if (!byFile) {
      byFile = new Map()
      grouped.set(hit.sceneKey, byFile)
    }
    let agg = byFile.get(hit.rawFilePath)
    if (!agg) {
      agg = { s: {}, f: {}, b: {} }
      byFile.set(hit.rawFilePath, agg)
    }
    mergeHitInto(agg, hit)
  }

  const compacted: CoverageHit[] = []
  const now = new Date()
  const oldIds = hits.map((h) => h.id)

  await prisma.$transaction(async (tx) => {
    await tx.coverageHit.deleteMany({ where: { id: { in: oldIds } } })

    for (const [sceneKey, byFile] of grouped) {
      for (const [rawFilePath, agg] of byFile) {
        const id = `agg|${buildHash}|${sceneKey}|${rawFilePath}`
        const row = await tx.coverageHit.create({
          data: {
            id,
            buildHash,
            sceneKey,
            rawFilePath,
            s: agg.s,
            f: agg.f,
            b: agg.b,
            createdAt: now,
          },
        })
        compacted.push(row)
      }
    }
  })

  return compacted
}

/** 跨 sceneKey 按文件路径再 merge 一次 */
export function mergeHitsAcrossScenes(hits: CoverageHit[]): Map<string, HitAgg> {
  const byFile = new Map<string, HitAgg>()
  for (const hit of hits) {
    let agg = byFile.get(hit.rawFilePath)
    if (!agg) {
      agg = { s: {}, f: {}, b: {} }
      byFile.set(hit.rawFilePath, agg)
    }
    mergeHitInto(agg, hit)
  }
  return byFile
}

type CoverageMapChunk = {
  statementMap?: unknown
  fnMap?: unknown
  branchMap?: unknown
}

/**
 * hit + CoverageMap(+SourceMap) → Istanbul coverage map
 * 简单版：不做 canyon-map remap，直接拼 FileCoverage
 */
export async function buildIstanbulCoverage(
  buildHash: string,
  hitByFile: Map<string, HitAgg>,
): Promise<Record<string, Record<string, unknown>>> {
  const relations = await prisma.coverageMapRelation.findMany({
    where: { buildHash },
  })

  const mapKeys = [...new Set(relations.map((r) => r.coverageMapKey))]
  const sourceMapHashes = [
    ...new Set(
      relations
        .map((r) => r.sourceMapHash)
        .filter((h): h is string => typeof h === 'string' && h.length > 0),
    ),
  ]

  const [maps, sourceMaps] = await Promise.all([
    prisma.coverageMap.findMany({ where: { hash: { in: mapKeys } } }),
    sourceMapHashes.length > 0
      ? prisma.coverageSourceMap.findMany({ where: { hash: { in: sourceMapHashes } } })
      : Promise.resolve([]),
  ])

  const mapIndex = new Map(maps.map((m) => [m.hash, m]))
  const sourceMapIndex = new Map(sourceMaps.map((s) => [s.hash, s]))
  const relationByPath = new Map<string, CoverageMapRelation>()
  for (const r of relations) {
    relationByPath.set(r.fullFilePath, r)
    if (r.restoreFullFilePath) {
      relationByPath.set(r.restoreFullFilePath, r)
    }
  }

  const istanbul: Record<string, Record<string, unknown>> = {}

  for (const [rawFilePath, hit] of hitByFile) {
    const relation = relationByPath.get(rawFilePath)
    const path = relation?.fullFilePath || rawFilePath
    const entry: Record<string, unknown> = {
      path,
      s: hit.s,
      f: hit.f,
      b: hit.b,
    }

    if (relation) {
      const cm = mapIndex.get(relation.coverageMapKey)
      if (cm) {
        const decoded = decodeCompressedObject(cm.map) as CoverageMapChunk | null
        if (decoded && typeof decoded === 'object') {
          entry.statementMap = decoded.statementMap ?? {}
          entry.fnMap = decoded.fnMap ?? {}
          entry.branchMap = decoded.branchMap ?? {}
        }
      }
      if (relation.sourceMapHash) {
        const sm = sourceMapIndex.get(relation.sourceMapHash)
        if (sm) {
          const decodedSm = decodeCompressedObject(sm.sourceMap)
          if (decodedSm) entry.inputSourceMap = decodedSm
        }
      }
    }

    istanbul[path] = entry
  }

  return istanbul
}

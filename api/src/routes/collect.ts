import { Prisma } from '@prisma/client'
import { Hono } from 'hono'
import { prisma } from '../db/index.js'
import {
  filterCoverageEntriesWithBuildHash,
  filterInvalidCoverageFiles,
  firstBuildHashInCoverage,
  normalizeClientBody,
  type CoverageEntry,
  type CoverageMap,
} from '../lib/coverage.js'
import { ensureBranchHitMap, ensureNumMap } from '../lib/coverage-merge.js'
import {
  buildIstanbulCoverage,
  compactHitsByScene,
  mergeHitsAcrossScenes,
  sceneMatches,
} from '../lib/coverage-snapshot.js'
import { encodeObjectToCompressedBuffer, generateObjectSignature } from '../lib/hash.js'

const collect = new Hono()

function isUniqueConflict(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
}

function calculateBuildHash(
  sha: string,
  provider: string,
  repoID: string,
  instrumentCwd: string,
  buildTarget?: string,
): string {
  return generateObjectSignature({
    sha,
    provider,
    repoID,
    instrumentCwd,
    buildTarget: buildTarget || '',
  })
}

/** 只 insert；并发下唯一冲突直接忽略 */
async function ensureScene(
  buildHash: string,
  sceneKey: string,
  scene: Record<string, unknown>,
  now: Date,
) {
  const id = `${buildHash}|${sceneKey}`
  try {
    await prisma.coverageScene.create({
      data: {
        id,
        buildHash,
        sceneKey,
        scene: scene as Prisma.InputJsonValue,
        createdAt: now,
        updatedAt: now,
      },
    })
  } catch (error) {
    if (!isUniqueConflict(error)) throw error
  }
  return id
}

/**
 * POST /api/coverage/map/init
 * 初始化 build + coverage map（不写 hit；hit 由 /client 追加写入）
 */
collect.post('/coverage/map/init', async (c) => {
  const body = await c.req.json<{
    coverage?: CoverageMap
    sha?: string
    provider?: string
    repoID?: string
    instrumentCwd?: string
    buildTarget?: string
  }>()

  const coverage = body.coverage
  if (!coverage || typeof coverage !== 'object' || Object.keys(coverage).length === 0) {
    return c.json({ success: false, message: 'coverage 不能为空' }, 400)
  }

  const firstEntry = Object.values(coverage)[0] as CoverageEntry
  // "" 也要回退到 coverage entry（?? 不会）
  const sha = body.sha || firstEntry?.sha
  const provider = body.provider || firstEntry?.provider
  const repoID = body.repoID || firstEntry?.repoID
  const instrumentCwd = body.instrumentCwd || firstEntry?.instrumentCwd
  const buildTarget = body.buildTarget || firstEntry?.buildTarget || ''
  if (!sha || !provider || !repoID || !instrumentCwd) {
    return c.json(
      { success: false, message: '缺少必要参数：sha, provider, repoID, instrumentCwd' },
      400,
    )
  }

  const buildHash = calculateBuildHash(sha, provider, repoID, instrumentCwd, buildTarget)
  const now = new Date()

  try {
    await prisma.coverageBuild.create({
      data: {
        buildHash,
        provider,
        repoID,
        sha,
        buildTarget,
        instrumentCwd,
        createdAt: now,
        updatedAt: now,
      },
    })
  } catch (error) {
    if (!isUniqueConflict(error)) throw error
  }

  const build = await prisma.coverageBuild.findUniqueOrThrow({ where: { buildHash } })

  // 默认空 scene，保证后续 hit 有父记录可挂
  const sceneKey = generateObjectSignature({})
  await ensureScene(buildHash, sceneKey, {}, now)

  const mapItems = Object.entries(coverage).map(([filePath, entry]) => {
    const chunkMap = {
      statementMap: entry.statementMap,
      fnMap: entry.fnMap,
      branchMap: entry.branchMap,
    }
    const hasSourceMap = Boolean(entry.inputSourceMap)
    const coverageMapHash = generateObjectSignature(
      hasSourceMap ? { ...chunkMap, inputSourceMap: 1 } : chunkMap,
    )
    const fileContentHash = entry.contentHash || ''
    const sourceMapHash = hasSourceMap
      ? generateObjectSignature(entry.inputSourceMap)
      : null

    return {
      filePath,
      chunkMap,
      coverageMapHash,
      fileContentHash,
      coverageMapKey: `${coverageMapHash}|${fileContentHash}`,
      sourceMap: hasSourceMap ? entry.inputSourceMap : undefined,
      sourceMapHash,
    }
  })

  await prisma.coverageMap.createMany({
    data: mapItems.map((item) => ({
      hash: item.coverageMapKey,
      map: new Uint8Array(encodeObjectToCompressedBuffer(item.chunkMap)),
      createdAt: now,
    })),
    skipDuplicates: true,
  })

  const sourceMapItems = mapItems.filter(
    (item): item is typeof item & { sourceMapHash: string; sourceMap: unknown } =>
      Boolean(item.sourceMapHash && item.sourceMap),
  )
  if (sourceMapItems.length > 0) {
    await prisma.coverageSourceMap.createMany({
      data: sourceMapItems.map((item) => ({
        hash: item.sourceMapHash,
        sourceMap: new Uint8Array(encodeObjectToCompressedBuffer(item.sourceMap)),
      })),
      skipDuplicates: true,
    })
  }

  await prisma.coverageMapRelation.createMany({
    data: mapItems.map((item) => ({
      id: `${buildHash}|${item.filePath}`,
      buildHash,
      fullFilePath: item.filePath,
      restoreFullFilePath: '',
      coverageMapHash: item.coverageMapHash,
      fileContentHash: item.fileContentHash,
      coverageMapKey: item.coverageMapKey,
      sourceMapHash: item.sourceMapHash,
    })),
    skipDuplicates: true,
  })

  return c.json({
    success: true,
    message: 'Coverage map initialized',
    data: {
      buildHash: build.buildHash,
      sceneKey,
      provider: build.provider,
      repoID: build.repoID,
      sha: build.sha,
      buildTarget: build.buildTarget,
      instrumentCwd: build.instrumentCwd,
      mapCount: mapItems.length,
      sourceMapCount: sourceMapItems.length,
    },
  })
})

/**
 * POST /api/coverage/client
 * hit 追加写入，不做读改写合并；同文件多行由后续快照聚合
 */
collect.post('/coverage/client', async (c) => {
  let coverage: CoverageMap
  let scene: Record<string, unknown>
  let rawBody: unknown

  try {
    rawBody = await c.req.json()
    ;({ coverage, scene } = normalizeClientBody(rawBody))
  } catch {
    return c.json({ success: false, message: '请求体无效，需为覆盖率文件 map' }, 400)
  }

  const payloadHash = generateObjectSignature(rawBody)
  const sceneKey = generateObjectSignature(scene)

  const withBuildHash = filterCoverageEntriesWithBuildHash(coverage)
  if (Object.keys(withBuildHash).length === 0) {
    return c.json({ success: false, message: 'coverage 中无带 buildHash 的有效文件条目' }, 400)
  }

  const filterResult = filterInvalidCoverageFiles(withBuildHash)
  if (filterResult.remainingFiles === 0) {
    return c.json(
      { success: false, message: '过滤后无有效覆盖率文件（语句 hit 均为 0 或缺少有效 s 字段）' },
      400,
    )
  }

  const filtered = filterResult.filteredCoverage
  const buildHash = firstBuildHashInCoverage(filtered)
  if (!buildHash) {
    return c.json({ success: false, message: 'coverage 中缺少 buildHash' }, 400)
  }

  const build = await prisma.coverageBuild.findUnique({ where: { buildHash } })
  if (!build) {
    return c.json(
      {
        success: false,
        message: '找不到对应的 CoverageBuild，请先调用 /api/coverage/map/init',
      },
      502,
    )
  }

  const base = {
    success: true as const,
    buildHash,
    sceneKey,
    coverageLength: filterResult.remainingFiles,
    coverageFilesTotal: filterResult.totalFiles,
    coverageFilesFiltered: filterResult.filteredFiles,
    provider: build.provider,
    repoID: build.repoID,
    sha: build.sha,
    buildTarget: build.buildTarget,
    instrumentCwd: build.instrumentCwd,
  }

  // 先抢幂等行，避免并发重复插入 hit
  try {
    await prisma.coverageClientPayloadIdempotency.create({
      data: { payloadHash },
    })
  } catch (error) {
    if (isUniqueConflict(error)) {
      return c.json({ ...base, idempotent: true, message: '重复负载，已忽略（幂等）' })
    }
    throw error
  }

  const now = new Date()
  await ensureScene(buildHash, sceneKey, scene, now)

  const hitRows = Object.entries(filtered).map(([filePath, entry]) => {
    const rawFilePath = entry.path || filePath
    return {
      id: `${payloadHash}|${rawFilePath}`,
      buildHash,
      sceneKey,
      rawFilePath,
      s: ensureNumMap(entry.s || {}),
      f: ensureNumMap(entry.f || {}),
      b: ensureBranchHitMap(entry.b || {}),
      createdAt: now,
    }
  })

  const created = await prisma.coverageHit.createMany({
    data: hitRows,
    skipDuplicates: true,
  })

  return c.json({ ...base, coverageLength: created.count })
})

/**
 * POST /api/coverage/snapshot
 * 1. 按 scene 过滤选出关联 hit
 * 2. 按 sceneKey+file 聚合写回 hit 表并删旧数据
 * 3. 跨 sceneKey merge，结合 map/sourcemap 还原 Istanbul，落入快照表
 */
collect.post('/coverage/snapshot', async (c) => {
  const body = await c.req.json<{
    buildHash?: string
    scene?: Record<string, unknown>
  }>()

  const buildHash = body.buildHash?.trim()
  if (!buildHash) {
    return c.json({ success: false, message: 'buildHash 不能为空' }, 400)
  }

  const sceneFilter =
    body.scene && typeof body.scene === 'object' && !Array.isArray(body.scene)
      ? body.scene
      : {}

  const build = await prisma.coverageBuild.findUnique({ where: { buildHash } })
  if (!build) {
    return c.json({ success: false, message: '找不到对应的 CoverageBuild' }, 404)
  }

  const scenes = await prisma.coverageScene.findMany({ where: { buildHash } })
  const matchedScenes = scenes.filter((s) => sceneMatches(s.scene, sceneFilter))
  if (matchedScenes.length === 0) {
    return c.json({ success: false, message: '没有匹配的 CoverageScene' }, 404)
  }

  const sceneKeys = matchedScenes.map((s) => s.sceneKey)
  const freezeTime = new Date()

  const snapshot = await prisma.coverageSnapshot.create({
    data: {
      buildHash,
      scene: sceneFilter as Prisma.InputJsonValue,
      status: 'generating',
      istanbul: {},
      fileCount: 0,
      hitCount: 0,
      createdAt: freezeTime,
    },
  })

  try {
    // 1) 按 sceneKey 聚合落回 hit 表，删除旧行
    const compactedHits = await compactHitsByScene(buildHash, sceneKeys, freezeTime)

    // 2) 跨 sceneKey merge
    const mergedByFile = mergeHitsAcrossScenes(compactedHits)

    // 3) 结合 map / sourcemap 还原 Istanbul
    const istanbul = await buildIstanbulCoverage(buildHash, mergedByFile)

    const finishedAt = new Date()
    const updated = await prisma.coverageSnapshot.update({
      where: { id: snapshot.id },
      data: {
        status: 'completed',
        istanbul: istanbul as Prisma.InputJsonValue,
        fileCount: Object.keys(istanbul).length,
        hitCount: compactedHits.length,
        finishedAt,
      },
    })

    return c.json({
      success: true,
      data: {
        id: updated.id,
        buildHash: updated.buildHash,
        scene: updated.scene,
        status: updated.status,
        fileCount: updated.fileCount,
        hitCount: updated.hitCount,
        sceneKeyCount: sceneKeys.length,
        createdAt: updated.createdAt,
        finishedAt: updated.finishedAt,
        // 简单版直接带回 istanbul；量大时可改成只返回 id
        istanbul: updated.istanbul,
      },
    })
  } catch (error) {
    await prisma.coverageSnapshot.update({
      where: { id: snapshot.id },
      data: {
        status: 'failed',
        finishedAt: new Date(),
      },
    })
    throw error
  }
})

export default collect

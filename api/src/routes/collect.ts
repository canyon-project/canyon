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

const SNAPSHOT_TIMEOUT_MS = 5 * 60 * 1000

const snapshotPublicSelect = {
  id: true,
  buildHash: true,
  scene: true,
  status: true,
  fileCount: true,
  hitCount: true,
  createdAt: true,
  finishedAt: true,
} as const

/** 进程内串行队列：queued 不计超时，真正开始 generating 后才计 5 分钟 */
const snapshotQueue: number[] = []
let snapshotWorkerRunning = false

function parseSnapshotId(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null
  const id = Number(raw)
  return Number.isSafeInteger(id) && id > 0 ? id : null
}

async function runSnapshotJob(
  snapshotId: number,
  buildHash: string,
  sceneKeys: string[],
  freezeTime: Date,
): Promise<void> {
  const compactedHits = await compactHitsByScene(buildHash, sceneKeys, freezeTime)
  const mergedByFile = mergeHitsAcrossScenes(compactedHits)
  const istanbul = await buildIstanbulCoverage(buildHash, mergedByFile)

  // 仅 generating 可转为 completed，避免覆盖已 timeout
  await prisma.coverageSnapshot.updateMany({
    where: { id: snapshotId, status: 'generating' },
    data: {
      status: 'completed',
      istanbul: istanbul as Prisma.InputJsonValue,
      fileCount: Object.keys(istanbul).length,
      hitCount: compactedHits.length,
      finishedAt: new Date(),
    },
  })
}

async function processSnapshotTask(snapshotId: number): Promise<void> {
  const claimed = await prisma.coverageSnapshot.updateMany({
    where: { id: snapshotId, status: 'queued' },
    data: { status: 'generating' },
  })
  if (claimed.count === 0) return

  const snapshot = await prisma.coverageSnapshot.findUnique({ where: { id: snapshotId } })
  if (!snapshot) return

  const sceneFilter =
    snapshot.scene && typeof snapshot.scene === 'object' && !Array.isArray(snapshot.scene)
      ? (snapshot.scene as Record<string, unknown>)
      : {}

  const scenes = await prisma.coverageScene.findMany({ where: { buildHash: snapshot.buildHash } })
  const sceneKeys = scenes
    .filter((s) => sceneMatches(s.scene, sceneFilter))
    .map((s) => s.sceneKey)

  // 真正开始时才冻结时间与超时计时
  const freezeTime = new Date()
  const timeout = setTimeout(() => {
    void prisma.coverageSnapshot
      .updateMany({
        where: { id: snapshotId, status: 'generating' },
        data: { status: 'timeout', finishedAt: new Date() },
      })
      .catch((error) => {
        console.error('[snapshot] mark timeout failed', snapshotId, error)
      })
  }, SNAPSHOT_TIMEOUT_MS)

  try {
    if (sceneKeys.length === 0) {
      await prisma.coverageSnapshot.updateMany({
        where: { id: snapshotId, status: 'generating' },
        data: { status: 'failed', finishedAt: new Date() },
      })
      return
    }
    await runSnapshotJob(snapshotId, snapshot.buildHash, sceneKeys, freezeTime)
  } catch (error) {
    console.error('[snapshot] generation failed', snapshotId, error)
    await prisma.coverageSnapshot
      .updateMany({
        where: { id: snapshotId, status: 'generating' },
        data: { status: 'failed', finishedAt: new Date() },
      })
      .catch((updateError) => {
        console.error('[snapshot] mark failed failed', snapshotId, updateError)
      })
  } finally {
    clearTimeout(timeout)
  }
}

async function pumpSnapshotQueue(): Promise<void> {
  if (snapshotWorkerRunning) return
  snapshotWorkerRunning = true
  try {
    while (snapshotQueue.length > 0) {
      const nextId = snapshotQueue.shift()
      if (!nextId) break
      await processSnapshotTask(nextId)
    }
  } finally {
    snapshotWorkerRunning = false
    if (snapshotQueue.length > 0) {
      void pumpSnapshotQueue()
    }
  }
}

function enqueueSnapshotTask(snapshotId: number): void {
  snapshotQueue.push(snapshotId)
  void pumpSnapshotQueue()
}

/**
 * POST /api/coverage/snapshot
 * 创建快照任务（queued）；有执行中任务时先排队，真正开始后才计 5 分钟超时
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

  const snapshot = await prisma.coverageSnapshot.create({
    data: {
      buildHash,
      scene: sceneFilter as Prisma.InputJsonValue,
      status: 'queued',
      istanbul: {},
      fileCount: 0,
      hitCount: 0,
    },
    select: snapshotPublicSelect,
  })

  enqueueSnapshotTask(snapshot.id)

  return c.json({
    success: true,
    data: snapshot,
  })
})

/**
 * GET /api/coverage/snapshot/:id/report-data
 * 查询快照还原后的 Istanbul.js coverage（仅 completed）
 */
collect.get('/coverage/snapshot/:id/report-data', async (c) => {
  const id = parseSnapshotId(c.req.param('id'))
  if (id == null) {
    return c.json({ success: false, message: 'invalid snapshot id' }, 400)
  }
  const snapshot = await prisma.coverageSnapshot.findUnique({
    where: { id },
    select: {
      id: true,
      buildHash: true,
      scene: true,
      status: true,
      istanbul: true,
      fileCount: true,
      hitCount: true,
      createdAt: true,
      finishedAt: true,
    },
  })
  if (!snapshot) {
    return c.json({ success: false, message: 'snapshot not found' }, 404)
  }
  if (snapshot.status !== 'completed') {
    return c.json(
      { success: false, message: `snapshot status is ${snapshot.status}` },
      409,
    )
  }

  return c.json({
    type: 'istanbuljs',
    version: '1.0.0',
    id: snapshot.id,
    buildHash: snapshot.buildHash,
    scene: snapshot.scene,
    fileCount: snapshot.fileCount,
    hitCount: snapshot.hitCount,
    createdAt: snapshot.createdAt,
    finishedAt: snapshot.finishedAt,
    coverage: snapshot.istanbul,
  })
})

/**
 * GET /api/coverage/snapshot/:id
 * 轮询快照任务状态（不含 istanbul）
 */
collect.get('/coverage/snapshot/:id', async (c) => {
  const id = parseSnapshotId(c.req.param('id'))
  if (id == null) {
    return c.json({ success: false, message: 'invalid snapshot id' }, 400)
  }
  const snapshot = await prisma.coverageSnapshot.findUnique({
    where: { id },
    select: snapshotPublicSelect,
  })
  if (!snapshot) {
    return c.json({ success: false, message: 'snapshot not found' }, 404)
  }
  return c.json({ success: true, data: snapshot })
})

export default collect

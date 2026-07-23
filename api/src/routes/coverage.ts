import { Prisma } from '@prisma/client'
import { Hono } from 'hono'
import { prisma } from '../db/index.js'
import {
  generateIstanbulHtmlReport,
  snapshotPublicReportDir,
  snapshotPublicReportUrl,
} from '../lib/coverage-html-report.js'
import {
  buildIstanbulCoverage,
  compactHitsByScene,
  mergeHitsAcrossScenes,
  sceneMatches,
} from '../lib/coverage-snapshot.js'
import { ensureGitlabSourceTree } from '../lib/gitlab.js'

const coverage = new Hono()

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

function withReportUrl<T extends { id: number; status: string }>(snapshot: T) {
  if (snapshot.status !== 'completed') return snapshot
  return {
    ...snapshot,
    reportUrl: snapshotPublicReportUrl(snapshot.id),
  }
}

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
  const build = await prisma.coverageBuild.findUniqueOrThrow({ where: { buildHash } })

  const compactedHits = await compactHitsByScene(buildHash, sceneKeys, freezeTime)
  const mergedByFile = mergeHitsAcrossScenes(compactedHits)
  const istanbul = await buildIstanbulCoverage(buildHash, mergedByFile)

  // 拉 GitLab 源码 zip → 解压 → 结合 Istanbul 生成 HTML 到 public/snapshots/{id}
  const sourceRoot = await ensureGitlabSourceTree(build.repoID, build.sha)
  await generateIstanbulHtmlReport({
    istanbul,
    instrumentCwd: build.instrumentCwd,
    sourceRoot,
    outputDir: snapshotPublicReportDir(snapshotId),
  })

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
coverage.post('/coverage/snapshot', async (c) => {
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
    data: withReportUrl(snapshot),
  })
})

/**
 * GET /api/coverage/snapshot/:id/report-data
 * 查询快照还原后的 Istanbul.js coverage（仅 completed）
 */
coverage.get('/coverage/snapshot/:id/report-data', async (c) => {
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
    reportUrl: snapshotPublicReportUrl(snapshot.id),
    coverage: snapshot.istanbul,
  })
})

/**
 * GET /api/coverage/snapshot/:id
 * 轮询快照任务状态（不含 istanbul）
 */
coverage.get('/coverage/snapshot/:id', async (c) => {
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
  return c.json({ success: true, data: withReportUrl(snapshot) })
})

export default coverage

import { createWriteStream } from 'node:fs'
import { mkdir, readdir, rm, stat } from 'node:fs/promises'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import type { Readable } from 'node:stream'
import AdmZip from 'adm-zip'
import axios from 'axios'

function requireGitlabEnv() {
  const baseUrl = (process.env.GITLAB_BASE_URL || '').replace(/\/+$/, '')
  const token = process.env.GITLAB_PRIVATE_TOKEN || ''
  if (!baseUrl) throw new Error('GITLAB_BASE_URL is not set')
  if (!token || token === 'your_gitlab_token') {
    throw new Error('GITLAB_PRIVATE_TOKEN is not set')
  }
  return { baseUrl, token }
}

function cacheKey(repoID: string, sha: string): string {
  return `${encodeURIComponent(repoID)}-${sha}`
}

function cacheRoot(): string {
  return path.resolve(process.cwd(), '.cache')
}

/** GitLab 归档 zip 解压后通常有一层 `project-sha/`，取该根目录 */
async function resolveExtractedRoot(extractDir: string): Promise<string> {
  const entries = await readdir(extractDir, { withFileTypes: true })
  const dirs = entries.filter((e) => e.isDirectory())
  if (dirs.length === 1) {
    return path.join(extractDir, dirs[0].name)
  }
  return extractDir
}

/**
 * 按 repoID + commit sha 下载 GitLab archive.zip 并解压。
 * 返回仓库根目录（已剥掉归档顶层目录）。
 */
export async function ensureGitlabSourceTree(repoID: string, sha: string): Promise<string> {
  const { baseUrl, token } = requireGitlabEnv()
  const key = cacheKey(repoID, sha)
  const archivePath = path.join(cacheRoot(), 'archives', `${key}.zip`)
  const extractDir = path.join(cacheRoot(), 'sources', key)

  try {
    const rootStat = await stat(extractDir)
    if (rootStat.isDirectory()) {
      return resolveExtractedRoot(extractDir)
    }
  } catch {
    // not cached
  }

  await mkdir(path.dirname(archivePath), { recursive: true })
  await mkdir(extractDir, { recursive: true })

  const projectId = encodeURIComponent(repoID)
  const url = `${baseUrl}/api/v4/projects/${projectId}/repository/archive.zip`
  const response = await axios.get(url, {
    params: { sha },
    headers: { 'PRIVATE-TOKEN': token },
    responseType: 'stream',
    timeout: 120_000,
    validateStatus: (status) => status >= 200 && status < 300,
  })

  await pipeline(response.data as Readable, createWriteStream(archivePath))

  // 解压前清空目标，避免半成品
  await rm(extractDir, { recursive: true, force: true })
  await mkdir(extractDir, { recursive: true })

  const zip = new AdmZip(archivePath)
  zip.extractAllTo(extractDir, true)

  return resolveExtractedRoot(extractDir)
}

// 基于 ESM 的演示脚本：
// 1) 连接 Postgres，从 canyonjs_config 读取 GitLab Base URL 与 Token
// 2) 使用 fetch 调用 GitLab API 执行示例查询（项目 / MR / Commit / 文件内容）

// 自动加载 .env（当前工作目录）
import 'dotenv/config'
import postgres from 'postgres'

// 从环境变量读取配置
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://username:password@localhost:5432/canyon?sslmode=disable'
const GITLAB_PROJECT_PATH = process.env.GITLAB_PROJECT_PATH // 例如："group/subgroup/repo"
const GITLAB_PROJECT_ID = process.env.GITLAB_PROJECT_ID && Number(process.env.GITLAB_PROJECT_ID)
const GITLAB_MR_IID = process.env.GITLAB_MR_IID && Number(process.env.GITLAB_MR_IID)
const GITLAB_COMMIT_SHA = process.env.GITLAB_COMMIT_SHA
const GITLAB_FILE_PATH = process.env.GITLAB_FILE_PATH // 例如："README.md"

async function getGitLabConfig(sql) {
  const baseURLRow = await sql`
    select value from canyonjs_config where key = 'system_config.gitlab_base_url' limit 1
  `
  if (!baseURLRow || baseURLRow.length === 0) {
    throw new Error('配置缺失: system_config.gitlab_base_url')
  }

  const tokenRow = await sql`
    select value from canyonjs_config where key = 'git_provider[0].private_token' limit 1
  `
  if (!tokenRow || tokenRow.length === 0) {
    throw new Error('配置缺失: git_provider[0].private_token')
  }

  return {
    baseURL: baseURLRow[0].value,
    token: tokenRow[0].value,
  }
}

async function fetchJSON(url, token) {
  const resp = await fetch(url, {
    headers: {
      'private-token': token,
      'Content-Type': 'application/json',
    },
  })
  if (!resp.ok) {
    const txt = await resp.text()
    throw new Error(`GitLab API请求失败: ${resp.status} ${resp.statusText} -> ${txt}`)
  }
  return resp.json()
}

async function getProjectByPath(baseURL, token, pathWithNamespace) {
  const encoded = encodeURIComponent(pathWithNamespace)
  const url = `${baseURL}/api/v4/projects/${encoded}`
  return fetchJSON(url, token)
}

async function getPullRequest(baseURL, token, projectID, mrIID) {
  const url = `${baseURL}/api/v4/projects/${projectID}/merge_requests/${mrIID}`
  return fetchJSON(url, token)
}

async function getPullRequestCommits(baseURL, token, projectID, mrIID) {
  const url = `${baseURL}/api/v4/projects/${projectID}/merge_requests/${mrIID}/commits`
  return fetchJSON(url, token)
}

async function getCommitBySHA(baseURL, token, projectID, sha) {
  const url = `${baseURL}/api/v4/projects/${projectID}/repository/commits/${sha}`
  return fetchJSON(url, token)
}

async function getFileContentBase64(baseURL, token, projectID, sha, filepath) {
  const encodedPath = encodeURIComponent(filepath)
  const url = `${baseURL}/api/v4/projects/${projectID}/repository/files/${encodedPath}?ref=${encodeURIComponent(sha)}`
  return fetchJSON(url, token) // { content: string(base64), encoding: 'base64' }
}

async function main() {
  const sql = postgres(DATABASE_URL, { max: 5 })
  try {
    console.log('[DB] 连接 PostgreSQL...')
    await sql`select 1 as ok` // 快速探活
    console.log('[DB] 连接成功')

    const { baseURL, token } = await getGitLabConfig(sql)
    console.log('[CFG] GitLab BaseURL:', baseURL)

    // 可选演示：优先使用 PATH 查询项目信息
    if (GITLAB_PROJECT_PATH) {
      console.log(`[DEMO] 通过路径查询项目信息: ${GITLAB_PROJECT_PATH}`)
      const project = await getProjectByPath(baseURL, token, GITLAB_PROJECT_PATH)
      console.log('[DEMO] 项目ID:', project.id, 'path:', project.path_with_namespace)
    }

    // 如果传入 projectID + MR IID，演示获取 MR 与 commits
    if (GITLAB_PROJECT_ID && GITLAB_MR_IID) {
      console.log(`[DEMO] 查询 MR: project=${GITLAB_PROJECT_ID}, iid=${GITLAB_MR_IID}`)
      const mr = await getPullRequest(baseURL, token, GITLAB_PROJECT_ID, GITLAB_MR_IID)
      console.log('[DEMO] MR 标题:', mr.title, '状态:', mr.state)

      const commits = await getPullRequestCommits(baseURL, token, GITLAB_PROJECT_ID, GITLAB_MR_IID)
      console.log('[DEMO] MR commits 数量:', commits.length)
      if (commits.length > 0) {
        console.log('[DEMO] 首个 commit:', commits[0].short_id, commits[0].title)
      }
    }

    // 如果传入 projectID + commit SHA，演示获取 commit 信息
    if (GITLAB_PROJECT_ID && GITLAB_COMMIT_SHA) {
      console.log(`[DEMO] 查询 Commit: project=${GITLAB_PROJECT_ID}, sha=${GITLAB_COMMIT_SHA}`)
      const commit = await getCommitBySHA(baseURL, token, GITLAB_PROJECT_ID, GITLAB_COMMIT_SHA)
      console.log('[DEMO] Commit:', commit.short_id, commit.title)
    }

    // 如果再提供文件路径，则演示获取文件内容（base64）
    if (GITLAB_PROJECT_ID && GITLAB_COMMIT_SHA && GITLAB_FILE_PATH) {
      console.log(`[DEMO] 查询文件内容: ${GITLAB_FILE_PATH}`)
      const file = await getFileContentBase64(baseURL, token, GITLAB_PROJECT_ID, GITLAB_COMMIT_SHA, GITLAB_FILE_PATH)
      console.log('[DEMO] 文件编码:', file.encoding)
      console.log('[DEMO] 文件内容Base64前64字节:', (file.content || '').slice(0, 64) + '...')
    }

    console.log('[DONE] 演示完成')
  } catch (err) {
    console.error('[ERROR]', err)
    process.exitCode = 1
  } finally {
    try { await sql.end({ timeout: 5 }) } catch {}
  }
}

// 允许直接运行：node main.js
// 需要 Node.js >= 18 (提供 fetch)
await main()



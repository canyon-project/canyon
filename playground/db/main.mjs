import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import dotenv from 'dotenv'
import { Client as PgClient } from 'pg'
import { createClient as createClickHouseClient } from '@clickhouse/client'

function resolveDotenvPath() {
  const rootEnv = path.resolve(process.cwd(), '../../.env')
  const localEnv = path.resolve(process.cwd(), '.env')
  if (fs.existsSync(rootEnv)) return rootEnv
  if (fs.existsSync(localEnv)) return localEnv
  return null
}

function loadEnv() {
  const envPath = resolveDotenvPath()
  if (envPath) {
    dotenv.config({ path: envPath })
    console.log(`Loaded .env from: ${envPath}`)
  } else {
    dotenv.config()
    console.warn('No explicit .env found, relying on process environment')
  }
}

function getRequiredEnv(name, fallback = undefined) {
  const value = process.env[name]
  if (value && value.length > 0) return value
  if (typeof fallback !== 'undefined') return fallback
  throw new Error(`缺少必要环境变量: ${name}`)
}

async function connectPostgres() {
  const databaseUrl = process.env.DATABASE_URL
  const pgConfig = databaseUrl
    ? { connectionString: databaseUrl }
    : {
        host: getRequiredEnv('PGHOST', 'localhost'),
        port: Number(getRequiredEnv('PGPORT', '5432')),
        user: getRequiredEnv('PGUSER', 'postgres'),
        password: getRequiredEnv('PGPASSWORD', ''),
        database: getRequiredEnv('PGDATABASE', 'postgres')
      }

  const client = new PgClient(pgConfig)
  await client.connect()
  const { rows } = await client.query('select 1 as ok')
  console.log('Postgres connected:', rows[0])
  await client.end()
}

async function createPgClient() {
  const databaseUrl = process.env.DATABASE_URL
  const pgConfig = databaseUrl
    ? { connectionString: databaseUrl }
    : {
        host: getRequiredEnv('PGHOST', 'localhost'),
        port: Number(getRequiredEnv('PGPORT', '5432')),
        user: getRequiredEnv('PGUSER', 'postgres'),
        password: getRequiredEnv('PGPASSWORD', ''),
        database: getRequiredEnv('PGDATABASE', 'postgres')
      }
  const client = new PgClient(pgConfig)
  await client.connect()
  return client
}

async function queryCoverageIdsByBuildId(pgClient, buildId, limit = 501) {
  const sql = `
    SELECT id
    FROM public.canyonjs_coverage
    WHERE build_id = $1
    LIMIT $2
  `
  const { rows } = await pgClient.query(sql, [buildId, limit])
  return rows.map((r) => r.id)
}

async function queryCoverageMapRelationsByCoverageIds(pgClient, coverageIds, limit = 1000) {
  if (!coverageIds.length) return []
  const sql = `
    SELECT file_path, coverage_map_hash_id
    FROM public.canyonjs_coverage_map_relation
    WHERE coverage_id = ANY($1::text[])
    LIMIT $2
  `
  const { rows } = await pgClient.query(sql, [coverageIds, limit])
  return rows
}

async function connectClickHouse() {
  const hostEnv = process.env.CLICKHOUSE_HOST || ''
  const url = process.env.CLICKHOUSE_URL || (hostEnv ? (hostEnv.startsWith('http') ? hostEnv : `http://${hostEnv}`) : '')
  if (!url) throw new Error('缺少 CLICKHOUSE_URL 或 CLICKHOUSE_HOST')
  const user = process.env.CLICKHOUSE_USER || 'default'
  const password = process.env.CLICKHOUSE_PASSWORD || ''
  const database = process.env.CLICKHOUSE_DATABASE || 'default'

  const client = createClickHouseClient({
    host: url,
    username: user,
    password,
    database
  })

  const result = await client.query({ query: 'select 1 as ok', format: 'JSONEachRow' })
  const rows = await result.json()
  console.log('ClickHouse connected:', rows[0])
  await client.close()
}

function hasClickHouseEnv() {
  return Boolean(process.env.CLICKHOUSE_URL || process.env.CLICKHOUSE_HOST)
}

async function createClickHouseClientFromEnv() {
  const hostEnv = process.env.CLICKHOUSE_HOST || ''
  const url = process.env.CLICKHOUSE_URL || (hostEnv ? (hostEnv.startsWith('http') ? hostEnv : `http://${hostEnv}`) : '')
  if (!url) throw new Error('缺少 CLICKHOUSE_URL 或 CLICKHOUSE_HOST')
  const user = process.env.CLICKHOUSE_USER || 'default'
  const password = process.env.CLICKHOUSE_PASSWORD || ''
  const database = process.env.CLICKHOUSE_DATABASE || 'default'
  const client = createClickHouseClient({ host: url, username: user, password, database })
  return client
}

async function queryClickHouseCoverageMapsByHashes(chClient, hashes, limit = 50) {
  if (!hashes.length) return []
  const limited = hashes.slice(0, Math.min(limit, hashes.length))
  const result = await chClient.query({
    query: 'SELECT hash, mapKeys(statement_map) AS s_keys FROM default.coverage_map WHERE hash IN {hashes:Array(String)} LIMIT {limit:UInt32}',
    format: 'JSONEachRow',
    query_params: { hashes: limited, limit: limited.length }
  })
  const rows = await result.json()
  return rows
}

async function main() {
  loadEnv()
  const buildId = process.env.BUILD_ID || process.argv[2] || '29150214'
  if (buildId) {
    console.log(`使用 build_id = ${buildId} 查询 Postgres ...`)
    let pgClient
    try {
      pgClient = await createPgClient()
      const coverageIds = await queryCoverageIdsByBuildId(pgClient, buildId, 501)
      console.log(`匹配 coverage 条数: ${coverageIds.length}`)
      if (coverageIds.length > 0) {
        const relations = await queryCoverageMapRelationsByCoverageIds(pgClient, coverageIds, 1000)
        console.log(`匹配 coverage_map_relation 条数: ${relations.length}`)
        if (relations.length > 0) {
          console.log('示例 relation 前 5 条:', relations.slice(0, 5))
          const uniqueHashes = Array.from(new Set(relations.map(r => r.coverage_map_hash_id))).slice(0, 2000)
          if (hasClickHouseEnv()) {
            try {
              const ch = await createClickHouseClientFromEnv()
              const chLimit = Number(process.env.CH_FETCH_LIMIT || '50')
              const maps = await queryClickHouseCoverageMapsByHashes(ch, uniqueHashes, chLimit)
              console.log(`ClickHouse coverage_map 命中 ${maps.length}/${uniqueHashes.length}`)
              if (maps.length > 0) {
                const preview = maps.slice(0, 5).map(m => ({ hash: m.hash, s_len: Array.isArray(m.s_keys) ? m.s_keys.length : 0 }))
                console.log('示例 coverage_map 前 5 条(含 s_keys 数量):', preview)
              }
              await ch.close()
            } catch (err) {
              console.error('ClickHouse 查询失败:', err)
            }
          } else {
            console.log('未配置 CLICKHOUSE_URL/CLICKHOUSE_HOST，跳过 ClickHouse 查询')
          }
        }
      }
    } catch (err) {
      console.error('Postgres 查询失败:', err)
    } finally {
      if (pgClient) await pgClient.end().catch(() => {})
    }
  } else {
    try {
      await connectPostgres()
    } catch (err) {
      console.error('Postgres 连接失败:', err)
    }
  }

  if (hasClickHouseEnv()) {
    try {
      await connectClickHouse()
    } catch (err) {
      console.error('ClickHouse 连接失败:', err)
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})





// SELECT id
//                  FROM public.canyonjs_coverage t
//                  WHERE build_id='29150214'
//                  LIMIT 501;

// select file_path,coverage_map_hash_id from canyonjs_coverage_map_relation where coverage_id in (

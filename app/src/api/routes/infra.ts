import { createRoute, z } from "@hono/zod-openapi";
import { OpenAPIHono } from "@hono/zod-openapi";
import { prisma } from "@/api/lib/prisma.ts";

const ProviderItemSchema = z
  .object({
    provider: z.string().describe("provider 标识，与 Repo.provider 一致，如 gitlab_tujia"),
    type: z.enum(["gitlab", "github"]).describe("SCM 类型"),
    baseUrl: z.string().describe("API 基础地址，GitHub 公开实例可为空"),
  })
  .openapi("ProviderItem");

const DbTableStatSchema = z
  .object({
    tableName: z.string(),
    rowEstimate: z.number(),
    totalBytes: z.number(),
    tableBytes: z.number(),
    indexBytes: z.number(),
    totalSizePretty: z.string(),
    tableSizePretty: z.string(),
    indexSizePretty: z.string(),
  })
  .openapi("DbTableStat");

/**
 * 从 Infra 配置键解析 provider 列表，含 type 与 baseUrl
 */
function buildProviderList(
  rows: { id: string; value: string }[],
): { provider: string; type: "gitlab" | "github"; baseUrl: string }[] {
  const keyToValue = new Map(rows.map((r) => [r.id, r.value]));
  const seen = new Set<string>();

  const result: { provider: string; type: "gitlab" | "github"; baseUrl: string }[] = [];

  for (const key of keyToValue.keys()) {
    const baseMatch = key.match(/^(.+)_BASE_URL$/);
    const tokenMatch = key.match(/^(.+)_PRIVATE_TOKEN$/);
    const prefix = baseMatch?.[1] ?? tokenMatch?.[1];
    if (!prefix) continue;

    const provider = prefix.toLowerCase();
    if (seen.has(provider)) continue;

    const p = provider;
    let type: "gitlab" | "github";
    if (p === "gitlab" || p.startsWith("gitlab_")) {
      type = "gitlab";
    } else if (p === "github" || p.startsWith("github_")) {
      type = "github";
    } else {
      continue;
    }

    const baseUrl = keyToValue.get(`${prefix}_BASE_URL`) ?? "";
    seen.add(provider);
    result.push({ provider, type, baseUrl });
  }

  return result.sort((a, b) => a.provider.localeCompare(b.provider));
}

const providersRoute = createRoute({
  method: "get",
  path: "/providers",
  summary: "获取 Provider 列表",
  description:
    "从 Infra 表解析已配置的 SCM provider 列表，返回 provider、type、baseUrl，用于添加仓库时选择。",
  tags: ["Infra"],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            providers: z.array(ProviderItemSchema),
          }),
        },
      },
      description: "Provider 列表",
    },
  },
});

const dbStatsRoute = createRoute({
  method: "get",
  path: "/db/stats",
  summary: "获取数据库表统计",
  description: "返回当前数据库各业务表的体积、索引体积和数据量估算。",
  tags: ["Infra"],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            tables: z.array(DbTableStatSchema),
            totals: z.object({
              tableCount: z.number(),
              rowEstimate: z.number(),
              totalBytes: z.number(),
              totalSizePretty: z.string(),
            }),
          }),
        },
      },
      description: "数据库统计",
    },
  },
});

type DbStatRow = {
  table_name: string;
  row_estimate: number | bigint | null;
  total_bytes: number | bigint;
  table_bytes: number | bigint;
  index_bytes: number | bigint;
  total_size_pretty: string;
  table_size_pretty: string;
  index_size_pretty: string;
};

const infraApi = new OpenAPIHono();

infraApi.openapi(providersRoute, async (c) => {
  const rows = await prisma.infra.findMany({ select: { id: true, value: true } });
  const providers = buildProviderList(rows);
  return c.json({ providers });
});

infraApi.openapi(dbStatsRoute, async (c) => {
  const rows: DbStatRow[] = await prisma.$queryRaw<DbStatRow[]>`SELECT
      c.relname AS table_name,
      COALESCE(s.n_live_tup, 0)::bigint AS row_estimate,
      pg_total_relation_size(c.oid)::bigint AS total_bytes,
      pg_relation_size(c.oid)::bigint AS table_bytes,
      pg_indexes_size(c.oid)::bigint AS index_bytes,
      pg_size_pretty(pg_total_relation_size(c.oid)) AS total_size_pretty,
      pg_size_pretty(pg_relation_size(c.oid)) AS table_size_pretty,
      pg_size_pretty(pg_indexes_size(c.oid)) AS index_size_pretty
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    LEFT JOIN pg_stat_user_tables s ON s.relid = c.oid
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND c.relname LIKE 'canyon_next_%'
    ORDER BY pg_total_relation_size(c.oid) DESC;`;

  const tables = rows.map((row: DbStatRow) => ({
    tableName: row.table_name,
    rowEstimate: Number(row.row_estimate ?? 0),
    totalBytes: Number(row.total_bytes),
    tableBytes: Number(row.table_bytes),
    indexBytes: Number(row.index_bytes),
    totalSizePretty: row.total_size_pretty,
    tableSizePretty: row.table_size_pretty,
    indexSizePretty: row.index_size_pretty,
  }));

  const totals = {
    tableCount: tables.length,
    rowEstimate: tables.reduce((sum: number, t: { rowEstimate: number }) => sum + t.rowEstimate, 0),
    totalBytes: tables.reduce((sum: number, t: { totalBytes: number }) => sum + t.totalBytes, 0),
    totalSizePretty: `${(tables.reduce((sum: number, t: { totalBytes: number }) => sum + t.totalBytes, 0) / 1024 / 1024).toFixed(2)} MB`,
  };

  return c.json({ tables, totals });
});

export default infraApi;

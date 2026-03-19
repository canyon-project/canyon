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

const infraApi = new OpenAPIHono();

infraApi.openapi(providersRoute, async (c) => {
  const rows = await prisma.infra.findMany({ select: { id: true, value: true } });
  const providers = buildProviderList(rows);
  return c.json({ providers });
});

export default infraApi;

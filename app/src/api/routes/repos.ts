import { createRoute, z } from "@hono/zod-openapi";
import { ProviderQueryParam } from "@/shared/schemas/provider.ts";
import { OpenAPIHono } from "@hono/zod-openapi";
import { prisma } from "@/api/lib/prisma.ts";
import { getScm } from "@/api/lib/scm.ts";
import { buildRepoUrl } from "@/api/lib/commit-url.ts";
import { getAuth } from "@/api/lib/auth.ts";
import { RepoSchema, CreateRepoSchema, UpdateRepoSchema } from "@/shared/schemas/repo.ts";

const IdParamSchema = z.object({
  id: z.string().openapi({ param: { name: "id", in: "path" } }),
});

const checkRoute = createRoute({
  method: "get",
  path: "/check",
  summary: "校验仓库信息",
  description:
    "从 GitLab/GitHub 拉取仓库信息，用于添加仓库前的校验。需提供 repoID（平台数字 ID）和 provider。",
  tags: ["仓库"],
  request: {
    query: z.object({
      repoID: z.string().openapi({ param: { name: "repoID", in: "query" } }),
      provider: ProviderQueryParam,
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            repoID: z.string(),
            pathWithNamespace: z.string(),
            description: z.string(),
          }),
        },
      },
      description: "仓库信息",
    },
    400: { description: "配置缺失或请求失败" },
  },
});

const buRoute = createRoute({
  method: "get",
  path: "/bu",
  summary: "获取 Bu 列表",
  description: "返回所有已配置的 Bu（业务单元）列表，用于筛选仓库。",
  tags: ["仓库"],
  responses: {
    200: {
      content: {
        "application/json": { schema: z.array(z.string()) },
      },
      description: "所有 Bu 列表",
    },
  },
});

const listRoute = createRoute({
  method: "get",
  path: "/",
  summary: "获取仓库列表",
  description:
    "返回所有仓库，支持按 bu 筛选、按 id/pathWithNamespace 搜索。附带覆盖率统计（reportTimes、lastReportTime）。",
  tags: ["仓库"],
  request: {
    query: z.object({
      bu: z
        .string()
        .optional()
        .openapi({ param: { name: "bu", in: "query" } }),
      search: z
        .string()
        .optional()
        .openapi({ param: { name: "search", in: "query" } }),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(RepoSchema),
        },
      },
      description: "仓库列表",
    },
  },
});

const getRoute = createRoute({
  method: "get",
  path: "/{id}",
  summary: "获取仓库详情",
  description:
    "根据 id（支持完整 id、pathWithNamespace 或数字 ID）返回仓库详情。会尝试从 SCM 拉取最新 description。",
  tags: ["仓库"],
  request: { params: IdParamSchema },
  responses: {
    200: {
      content: {
        "application/json": { schema: RepoSchema },
      },
      description: "仓库详情",
    },
    404: { description: "未找到" },
  },
});

const createRouteDef = createRoute({
  method: "post",
  path: "/",
  summary: "创建仓库",
  description:
    "将 GitLab/GitHub 仓库添加到系统中。必传 provider、repoID，通过 SCM 接口获取 pathWithNamespace、description 等。",
  tags: ["仓库"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateRepoSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": { schema: RepoSchema },
      },
      description: "创建成功",
    },
    400: { description: "参数错误或获取仓库信息失败" },
    401: { description: "未登录" },
  },
});

const updateRoute = createRoute({
  method: "put",
  path: "/{id}",
  summary: "更新仓库",
  description: "更新仓库的 description、config、bu 等配置。",
  tags: ["仓库"],
  request: {
    params: IdParamSchema,
    body: {
      content: {
        "application/json": {
          schema: UpdateRepoSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": { schema: RepoSchema },
      },
      description: "更新成功",
    },
    404: { description: "未找到" },
  },
});

const deleteRoute = createRoute({
  method: "delete",
  path: "/{id}",
  summary: "删除仓库",
  description: "从系统中移除指定仓库。",
  tags: ["仓库"],
  request: { params: IdParamSchema },
  responses: {
    204: { description: "删除成功" },
    404: { description: "未找到" },
  },
});

const reposApi = new OpenAPIHono();

const toResponse = (
  r: {
    id: string;
    provider: string;
    pathWithNamespace: string;
    description: string;
    config: string;
    bu: string;
    creator: string;
    createdAt: Date;
    updatedAt: Date;
  },
  extra?: { reportTimes?: number; lastReportTime?: Date | null },
) => ({
  ...r,
  createdAt: r.createdAt.toISOString(),
  updatedAt: r.updatedAt.toISOString(),
  ...(extra && {
    reportTimes: extra.reportTimes ?? 0,
    lastReportTime: extra.lastReportTime?.toISOString() ?? null,
  }),
});

reposApi.openapi(checkRoute, async (c) => {
  const { repoID, provider } = c.req.valid("query");
  const scm = getScm(provider);
  if (!scm) {
    return c.json({ error: `不支持的 provider 或配置缺失: ${provider}` }, 400);
  }
  try {
    const info = await scm.getRepoInfo(repoID.trim());
    return c.json({
      repoID: info.id,
      pathWithNamespace: info.pathWithNamespace,
      description: info.description ?? "",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "获取仓库信息失败";
    return c.json({ error: msg }, 400);
  }
});

reposApi.openapi(buRoute, async (c) => {
  const rows = await prisma.repo.findMany({
    select: { bu: true },
    distinct: ["bu"],
    where: { bu: { not: "" } },
    orderBy: { bu: "asc" },
  });
  return c.json(rows.map((r) => r.bu).filter(Boolean));
});

reposApi.openapi(listRoute, async (c) => {
  const query = c.req.valid("query");
  const where: {
    bu?: string;
    OR?: Array<{ id?: { contains: string }; pathWithNamespace?: { contains: string } }>;
  } = {};
  if (query?.bu) where.bu = query.bu;
  if (query?.search) {
    where.OR = [
      { id: { contains: query.search } },
      { pathWithNamespace: { contains: query.search } },
    ];
  }
  const rows = await prisma.repo.findMany({ where });

  const repoIdsForCoverage = [
    ...new Set(
      rows.flatMap((r) => {
        const idPart = r.id.includes("-") ? r.id.slice(r.id.indexOf("-") + 1) : r.id;
        return [idPart, r.pathWithNamespace];
      }),
    ),
  ];

  const coverageStats = await prisma.coverage.groupBy({
    by: ["repoID"],
    where: { repoID: { in: repoIdsForCoverage } },
    _count: { id: true },
    _max: { createdAt: true },
  });

  const statsMap = new Map(
    coverageStats.map((s) => [s.repoID, { count: s._count.id, lastReportTime: s._max.createdAt }]),
  );

  const reposWithStats = rows.map((r) => {
    const repoID = r.id.includes("-") ? r.id.slice(r.id.indexOf("-") + 1) : r.id;
    const stats = statsMap.get(repoID) ?? statsMap.get(r.pathWithNamespace);
    const resp = toResponse(r, {
      reportTimes: stats?.count ?? 0,
      lastReportTime: stats?.lastReportTime ?? null,
    });
    return { ...resp, repoUrl: buildRepoUrl(r.provider, r.pathWithNamespace) };
  });

  reposWithStats.sort((a, b) => {
    const aTime = a.lastReportTime ? new Date(a.lastReportTime).getTime() : 0;
    const bTime = b.lastReportTime ? new Date(b.lastReportTime).getTime() : 0;
    if (aTime && bTime) return bTime - aTime;
    if (aTime && !bTime) return -1;
    if (!aTime && bTime) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return c.json(reposWithStats);
});

reposApi.openapi(getRoute, async (c) => {
  const { id } = c.req.valid("param");
  const decodedId = decodeURIComponent(id);
  let repo = null;
  if (decodedId.includes("/")) {
    repo = await prisma.repo.findFirst({
      where: { pathWithNamespace: decodedId },
    });
  } else {
    repo = await prisma.repo.findUnique({
      where: { id: decodedId },
    });
  }
  if (!repo) {
    return c.json({ error: "Not found" }, 404);
  }
  const response = toResponse(repo);

  // 尝试从 SCM（GitLab/GitHub）拉取最新仓库信息，丰富 description
  const scm = getScm(repo.provider);
  if (scm) {
    try {
      const scmInfo = await scm.getRepoInfo(repo.pathWithNamespace);
      response.description = scmInfo.description;
    } catch {
      // SCM 请求失败时保留 DB 中的 description
    }
  }

  return c.json(response);
});

reposApi.openapi(createRouteDef, async (c) => {
  const session = await getAuth().api.getSession({
    headers: c.req.raw.headers,
  });
  if (!session?.user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const creator = session.user.id;
  const body = c.req.valid("json");
  const scm = getScm(body.provider);
  if (!scm) {
    return c.json({ error: `不支持的 provider 或配置缺失: ${body.provider}` }, 400);
  }
  try {
    const info = await scm.getRepoInfo(body.repoID.trim());
    const id = `${body.provider}-${info.id}`;
    const now = new Date();
    const repo = await prisma.repo.create({
      data: {
        id,
        provider: body.provider,
        pathWithNamespace: info.pathWithNamespace,
        description: info.description ?? "",
        config: body.config ?? "",
        bu: info.bu ?? body.bu ?? "",
        creator,
        createdAt: now,
        updatedAt: now,
      },
    });
    return c.json(toResponse(repo), 201);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "获取仓库信息失败";
    return c.json({ error: msg }, 400);
  }
});

async function resolveRepoId(id: string): Promise<string | null> {
  const decodedId = decodeURIComponent(id);
  if (decodedId.includes("/")) {
    const repo = await prisma.repo.findFirst({
      where: { pathWithNamespace: decodedId },
    });
    return repo?.id ?? null;
  }
  const repo = await prisma.repo.findUnique({
    where: { id: decodedId },
  });
  return repo?.id ?? null;
}

reposApi.openapi(updateRoute, async (c) => {
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");
  const resolvedId = await resolveRepoId(id);
  if (!resolvedId) return c.json({ error: "Not found" }, 404);
  try {
    const repo = await prisma.repo.update({
      where: { id: resolvedId },
      data: {
        ...(body.description !== undefined && { description: body.description }),
        ...(body.config !== undefined && { config: body.config }),
        ...(body.bu !== undefined && { bu: body.bu }),
        updatedAt: new Date(),
      },
    });
    return c.json(toResponse(repo));
  } catch {
    return c.json({ error: "Not found" }, 404);
  }
});

reposApi.openapi(deleteRoute, async (c) => {
  const { id } = c.req.valid("param");
  const resolvedId = await resolveRepoId(id);
  if (!resolvedId) return c.json({ error: "Not found" }, 404);
  try {
    await prisma.repo.delete({
      where: { id: resolvedId },
    });
    return c.body(null, 204);
  } catch {
    return c.json({ error: "Not found" }, 404);
  }
});

export default reposApi;

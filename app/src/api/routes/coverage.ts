import { createRoute, z } from "@hono/zod-openapi";
import { OpenAPIHono } from "@hono/zod-openapi";
import { prisma } from "@/api/lib/prisma.ts";
import { getCoverageMapForCommit } from "@/api/lib/coverage/coverage-map-for-commit.ts";
import { getCoverageMapForCr } from "@/api/lib/coverage/coverage-map-for-cr.ts";
import { getCoverageMapForCompare } from "@/api/lib/coverage/coverage-map-for-compare.ts";
import { buildCommitUrl } from "@/api/lib/commit-url.ts";
import { getCommitsByRepoID } from "@/api/lib/coverage/commits.ts";
import { CoverageMapQuerySchema, CoverageCommitsQuerySchema } from "@/shared/schemas/coverage.ts";
import { genSummaryMapByCoverageMap } from "canyon-data";

const coverageMapGetRoute = createRoute({
  method: "get",
  path: "/map",
  summary: "获取覆盖率 Map",
  description:
    "根据 subject=commit、subjectID（sha）、provider、repoID 等获取指定 commit 的覆盖率 map 数据。",
  tags: ["覆盖率"],
  request: { query: CoverageMapQuerySchema },
  responses: {
    200: { description: "覆盖率 map" },
    400: { description: "参数错误或 subject 非 commit" },
  },
});

const coverageSummaryMapRoute = createRoute({
  method: "get",
  path: "/summary/map",
  summary: "获取覆盖率 Summary Map",
  description: "获取指定 commit 的覆盖率汇总 map，用于报告展示。参数同 /map。",
  tags: ["覆盖率"],
  request: { query: CoverageMapQuerySchema },
  responses: {
    200: { description: "覆盖率 summary map" },
    400: { description: "参数错误或 subject 非 commit" },
  },
});

const coverageCommitsRoute = createRoute({
  method: "get",
  path: "/commits",
  summary: "获取 Commits 列表",
  description: "根据 repoID 获取该仓库下有覆盖率数据的 commits 列表，支持分页（page、pageSize）。",
  tags: ["覆盖率"],
  request: { query: CoverageCommitsQuerySchema },
  responses: {
    200: { description: "commits 列表" },
  },
});

const coverageCleanupExpiredRoute = createRoute({
  method: "post",
  path: "/cleanup/expired",
  summary: "清理过期覆盖率数据",
  description:
    "以 Coverage 表为入口，按 createdAt 清理超过 30 天的数据。单次最多清理 100 条 Coverage，并按 buildHash 清理 CoverageHit 与 CoverageMapRelation。",
  tags: ["覆盖率"],
  responses: {
    200: {
      description: "清理结果",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            expiredBefore: z.string(),
            batchSize: z.number(),
            selectedCoverageCount: z.number(),
            deletedCoverageCount: z.number(),
            deletedBuildHashCount: z.number(),
            deletedCoverageHitCount: z.number(),
            deletedCoverageMapRelationCount: z.number(),
          }),
        },
      },
    },
  },
});

const coverageApi = new OpenAPIHono();

/** 解析 repoID：支持数字 ID、pathWithNamespace、provider:pathWithNamespace */
async function resolveRepoIDForCoverage(repoID: string): Promise<string> {
  const trimmed = repoID.trim();
  if (!trimmed) return trimmed;

  const coverages = await prisma.coverage.findMany({
    where: { repoID: trimmed },
    take: 1,
  });
  if (coverages.length > 0) return trimmed;

  if (trimmed.includes(":")) {
    const pathPart = trimmed.split(":").slice(1).join(":");
    const byPath = await prisma.coverage.findMany({
      where: { repoID: pathPart },
      take: 1,
    });
    if (byPath.length > 0) return pathPart;
  }

  const repo = await prisma.repo.findFirst({
    where: {
      OR: [{ id: { contains: trimmed } }, { pathWithNamespace: trimmed }],
    },
  });
  if (repo) {
    const byPath = await prisma.coverage.findMany({
      where: { repoID: repo.pathWithNamespace },
      take: 1,
    });
    if (byPath.length > 0) return repo.pathWithNamespace;
    const byId = await prisma.coverage.findMany({
      where: { repoID: repo.id },
      take: 1,
    });
    if (byId.length > 0) return repo.id;
  }

  return trimmed;
}

async function getMapBySubject(q: {
  subject: string;
  subjectID: string;
  provider: string;
  repoID: string;
  buildTarget?: string;
  filePath?: string;
  scene?: string;
}) {
  switch (q.subject) {
    case "commit":
      return getCoverageMapForCommit({
        provider: q.provider,
        repoID: q.repoID,
        sha: q.subjectID,
        buildTarget: q.buildTarget ?? "",
        filePath: q.filePath,
        scene: q.scene,
      });
    case "pull":
    case "merge_requests": {
      const result = await getCoverageMapForCr({
        provider: q.provider,
        repoID: q.repoID,
        crID: q.subjectID,
        buildTarget: q.buildTarget ?? "",
        filePath: q.filePath,
        scene: q.scene,
      });
      if (result.success && result.coverage) return result.coverage;
      return result;
    }
    case "compare": {
      const result = await getCoverageMapForCompare({
        provider: q.provider,
        repoID: q.repoID,
        compareID: q.subjectID,
        buildTarget: q.buildTarget ?? "",
        filePath: q.filePath,
        scene: q.scene,
      });
      if (result.success && result.coverage) return result.coverage;
      return result;
    }
    default:
      return { success: false, message: "invalid subject" };
  }
}

coverageApi.openapi(coverageMapGetRoute, async (c) => {
  const q = c.req.valid("query");
  const result = await getMapBySubject(q);
  if (typeof result === "object" && "success" in result && result.success === false) {
    return c.json(
      { success: false, message: (result as { message?: string }).message ?? "Failed" },
      400,
    );
  }
  return c.json(result);
});

coverageApi.openapi(coverageSummaryMapRoute, async (c) => {
  const q = c.req.valid("query");
  const map = await getMapBySubject(q);
  if (typeof map === "object" && "success" in map && map.success === false) {
    return c.json(
      { success: false, message: (map as { message?: string }).message ?? "Failed" },
      400,
    );
  }
  const coverage = map as unknown as Record<string, any>;
  const diffAdditions =
    q.subject === "pull" || q.subject === "merge_requests" || q.subject === "compare"
      ? Object.values(coverage)
          .map((m: unknown) => {
            const o = m as { path?: string; diff?: { additions?: number[] } };
            return { path: o?.path, additions: o?.diff?.additions || [] };
          })
          .filter((item): item is { path: string; additions: number[] } =>
            Boolean(item.path) && item.additions.length > 0,
          )
      : [];
  const summary = genSummaryMapByCoverageMap(coverage, diffAdditions);
  return c.json(summary);
});

coverageApi.openapi(coverageCommitsRoute, async (c) => {
  const { repoID, pathWithNamespace, provider, page, pageSize } = c.req.valid("query");
  const resolvedRepoID = await resolveRepoIDForCoverage(repoID);
  const commits = await getCommitsByRepoID(resolvedRepoID);
  const total = commits.length;
  const start = (page - 1) * pageSize;
  const data = commits.slice(start, start + pageSize);

  let pathForUrl = pathWithNamespace || (resolvedRepoID.includes("/") ? resolvedRepoID : null);
  if (!pathForUrl) {
    const repoRow = await prisma.repo.findFirst({
      where: {
        OR: [
          { id: resolvedRepoID },
          { id: { contains: resolvedRepoID } },
          { pathWithNamespace: resolvedRepoID },
        ],
      },
      select: { pathWithNamespace: true },
    });
    pathForUrl = repoRow?.pathWithNamespace ?? null;
  }
  const providerForUrl = provider || (commits[0] as { provider?: string } | undefined)?.provider;
  if (pathForUrl && providerForUrl) {
    for (const commit of data) {
      commit.commitUrl = buildCommitUrl(providerForUrl, pathForUrl, commit.sha);
    }
  }

  return c.json({ data, total });
});

coverageApi.openapi(coverageCleanupExpiredRoute, async (c) => {
  const EXPIRE_DAYS = 30;
  const BATCH_SIZE = 100;
  const expiredBefore = new Date(Date.now() - EXPIRE_DAYS * 24 * 60 * 60 * 1000);

  const expiredCoverages = await prisma.coverage.findMany({
    where: { createdAt: { lt: expiredBefore } },
    orderBy: { createdAt: "asc" },
    take: BATCH_SIZE,
    select: { id: true, buildHash: true },
  });

  if (expiredCoverages.length === 0) {
    return c.json({
      success: true,
      expiredBefore: expiredBefore.toISOString(),
      batchSize: BATCH_SIZE,
      selectedCoverageCount: 0,
      deletedCoverageCount: 0,
      deletedBuildHashCount: 0,
      deletedCoverageHitCount: 0,
      deletedCoverageMapRelationCount: 0,
    });
  }

  const coverageIDs = expiredCoverages.map((item: { id: string }) => item.id);
  const candidateBuildHashes = [
    ...new Set(expiredCoverages.map((item: { buildHash: string }) => item.buildHash)),
  ];

  // 仅清理“同 buildHash 全部超过 30 天”的关联数据，避免误删仍有新数据的 buildHash
  const stillActiveRows = await prisma.coverage.findMany({
    where: {
      buildHash: { in: candidateBuildHashes },
      createdAt: { gte: expiredBefore },
    },
    select: { buildHash: true },
    distinct: ["buildHash"],
  });
  const stillReferencedBuildHashes = new Set(stillActiveRows.map((row: { buildHash: string }) => row.buildHash));
  const deletableBuildHashes = candidateBuildHashes.filter(
    (buildHash) => !stillReferencedBuildHashes.has(buildHash),
  );

  const deletedCoverage = await prisma.coverage.deleteMany({
    where: { id: { in: coverageIDs } },
  });

  if (deletableBuildHashes.length === 0) {
    return c.json({
      success: true,
      expiredBefore: expiredBefore.toISOString(),
      batchSize: BATCH_SIZE,
      selectedCoverageCount: expiredCoverages.length,
      deletedCoverageCount: deletedCoverage.count,
      deletedBuildHashCount: 0,
      deletedCoverageHitCount: 0,
      deletedCoverageMapRelationCount: 0,
    });
  }

  const [deletedCoverageHit, deletedCoverageMapRelation] = await prisma.$transaction([
    prisma.coverageHit.deleteMany({
      where: { buildHash: { in: deletableBuildHashes } },
    }),
    prisma.coverageMapRelation.deleteMany({
      where: { buildHash: { in: deletableBuildHashes } },
    }),
  ]);

  return c.json({
    success: true,
    expiredBefore: expiredBefore.toISOString(),
    batchSize: BATCH_SIZE,
    selectedCoverageCount: expiredCoverages.length,
    deletedCoverageCount: deletedCoverage.count,
    deletedBuildHashCount: deletableBuildHashes.length,
    deletedCoverageHitCount: deletedCoverageHit.count,
    deletedCoverageMapRelationCount: deletedCoverageMapRelation.count,
  });
});

export default coverageApi;

import { createRoute, z } from "@hono/zod-openapi";
import { OpenAPIHono } from "@hono/zod-openapi";
import { prisma } from "@/api/lib/prisma.ts";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { access, cp, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { createRequire } from "node:module";
import { getCoverageMapForCommit } from "@/api/lib/coverage/coverage-map-for-commit.ts";
import { getCoverageMapForCr } from "@/api/lib/coverage/coverage-map-for-cr.ts";
import { getCoverageMapForCompare } from "@/api/lib/coverage/coverage-map-for-compare.ts";
import { buildCommitUrl } from "@/api/lib/commit-url.ts";
import { getCommitsByRepoID } from "@/api/lib/coverage/commits.ts";
import { getScm } from "@/api/lib/scm.ts";
import { CoverageMapQuerySchema, CoverageCommitsQuerySchema } from "@/shared/schemas/coverage.ts";
import { genSummaryMapByCoverageMap } from "canyon-data";

const require = createRequire(import.meta.url);

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
    "以 Coverage 表为入口清理数据。可选传 buildHash（支持 string 或 string[]）按指定构建删除；未传时按 createdAt 清理超过 30 天的数据（单次最多 100 条）。并按 buildHash 清理 CoverageHit 与 CoverageMapRelation。",
  tags: ["覆盖率"],
  request: {
    body: {
      required: false,
      content: {
        "application/json": {
          schema: z.object({
            buildHash: z.union([z.string(), z.array(z.string())]).optional(),
          }),
        },
      },
    },
  },
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

const coverageCleanupOrphanMapsRoute = createRoute({
  method: "post",
  path: "/cleanup/orphan-maps",
  summary: "清理无引用的 Map 数据",
  description:
    "清理未被 CoverageMapRelation 引用的 CoverageMap 与 CoverageSourceMap。该接口与过期数据删除解耦，单次各最多删除 100 条。",
  tags: ["覆盖率"],
  responses: {
    200: {
      description: "清理结果",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            batchSize: z.number(),
            deletedCoverageMapCount: z.number(),
            deletedCoverageSourceMapCount: z.number(),
          }),
        },
      },
    },
  },
});

const snapshotCreateRoute = createRoute({
  method: "post",
  path: "/snapshot",
  summary: "创建覆盖率快照",
  description:
    "基于 /coverage/map 全量数据创建快照。创建后状态先为 generating，完成后为 completed，超过 120 秒置为 timeout。",
  tags: ["覆盖率"],
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: z.object({
            provider: z.string(),
            repoID: z.string(),
            subject: z.enum(["commit", "compare"]).optional().default("commit"),
            subjectID: z.string().optional(),
            sha: z.string().optional(),
            buildTarget: z.string().optional(),
            title: z.string().optional(),
            description: z.string().optional(),
            createdBy: z.string().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "创建结果",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.object({
              id: z.number(),
              status: z.string(),
              provider: z.string(),
              repoID: z.string(),
              subject: z.string(),
              subjectID: z.string(),
              createdAt: z.string(),
            }),
          }),
        },
      },
    },
    400: {
      description: "参数错误",
    },
  },
});

const snapshotListRoute = createRoute({
  method: "get",
  path: "/snapshot",
  summary: "查询覆盖率快照列表",
  tags: ["覆盖率"],
  request: {
    query: z.object({
      provider: z.string().openapi({ param: { name: "provider", in: "query" } }),
      repoID: z.string().openapi({ param: { name: "repoID", in: "query" } }),
      subject: z
        .enum(["commit", "compare"])
        .optional()
        .openapi({ param: { name: "subject", in: "query" } }),
      page: z.coerce
        .number()
        .optional()
        .default(1)
        .openapi({ param: { name: "page", in: "query" } }),
      pageSize: z.coerce
        .number()
        .optional()
        .default(20)
        .openapi({ param: { name: "pageSize", in: "query" } }),
    }),
  },
  responses: {
    200: {
      description: "快照列表",
      content: {
        "application/json": {
          schema: z.object({
            data: z.array(
              z.object({
                id: z.number(),
                provider: z.string(),
                repoID: z.string(),
                subject: z.string(),
                subjectID: z.string(),
                sha: z.string(),
                title: z.string().nullable(),
                description: z.string().nullable(),
                status: z.string(),
                artifactSize: z.number(),
                createdBy: z.string(),
                createdAt: z.string(),
                freezeTime: z.string(),
                finishedAt: z.string(),
                buildHash: z.string(),
                statementsCovered: z.number().nullable(),
                statementsTotal: z.number().nullable(),
                changestatementsCovered: z.number().nullable(),
                changestatementsTotal: z.number().nullable(),
                durationMs: z.number().nullable(),
              }),
            ),
            total: z.number(),
          }),
        },
      },
    },
  },
});

const snapshotGetRoute = createRoute({
  method: "get",
  path: "/snapshot/{id}",
  summary: "获取单个覆盖率快照",
  tags: ["覆盖率"],
  request: {
    params: z.object({
      id: z.coerce.number().openapi({ param: { name: "id", in: "path" } }),
    }),
  },
  responses: {
    200: {
      description: "快照详情",
      content: {
        "application/json": {
          schema: z.object({
            id: z.number(),
            provider: z.string(),
            repoID: z.string(),
            subject: z.string(),
            subjectID: z.string(),
            sha: z.string(),
            title: z.string().nullable(),
            description: z.string().nullable(),
            status: z.string(),
            artifactSize: z.number(),
            createdBy: z.string(),
            createdAt: z.string(),
            freezeTime: z.string(),
            finishedAt: z.string(),
            buildHash: z.string(),
            statementsCovered: z.number().nullable(),
            statementsTotal: z.number().nullable(),
            changestatementsCovered: z.number().nullable(),
            changestatementsTotal: z.number().nullable(),
            durationMs: z.number().nullable(),
          }),
        },
      },
    },
    404: { description: "快照不存在" },
  },
});

const snapshotUpdateRoute = createRoute({
  method: "patch",
  path: "/snapshot/{id}",
  summary: "更新覆盖率快照元数据",
  tags: ["覆盖率"],
  request: {
    params: z.object({
      id: z.coerce.number().openapi({ param: { name: "id", in: "path" } }),
    }),
    body: {
      required: true,
      content: {
        "application/json": {
          schema: z.object({
            title: z.string().optional(),
            description: z.string().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: { description: "更新结果" },
    404: { description: "快照不存在" },
  },
});

const snapshotDeleteRoute = createRoute({
  method: "delete",
  path: "/snapshot/{id}",
  summary: "删除覆盖率快照",
  tags: ["覆盖率"],
  request: {
    params: z.object({
      id: z.coerce.number().openapi({ param: { name: "id", in: "path" } }),
    }),
  },
  responses: {
    200: { description: "删除结果" },
    404: { description: "快照不存在" },
  },
});

const snapshotDownloadRoute = createRoute({
  method: "get",
  path: "/snapshot/{id}/download",
  summary: "下载覆盖率快照产物",
  tags: ["覆盖率"],
  request: {
    params: z.object({
      id: z.coerce.number().openapi({ param: { name: "id", in: "path" } }),
    }),
  },
  responses: {
    200: { description: "快照压缩产物" },
    404: { description: "快照不存在" },
  },
});

const coverageApi = new OpenAPIHono();
const SNAPSHOT_TIMEOUT_MS = 120 * 1000;
const SNAPSHOT_TIMEOUT_MESSAGE = "snapshot generation timeout";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function stringifyUnknownError(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

function isSnapshotTimeoutError(error: unknown) {
  if (!(error instanceof Error)) return false;
  return error.message === SNAPSHOT_TIMEOUT_MESSAGE;
}

async function markExpiredGeneratingSnapshots() {
  const expiredBefore = new Date(Date.now() - SNAPSHOT_TIMEOUT_MS);
  await prisma.coverageSnapshot.updateMany({
    where: {
      status: "generating",
      createdAt: { lt: expiredBefore },
    },
    data: {
      status: "timeout",
      description: `snapshot failed: ${SNAPSHOT_TIMEOUT_MESSAGE}`,
      finishedAt: new Date(),
    },
  });
}

function normalizeSnapshotRow(row: {
  id: number;
  provider: string;
  repoID: string;
  subject: string;
  subjectID: string;
  title: string | null;
  description: string | null;
  status: string;
  artifactSize: number;
  createdBy: string;
  createdAt: Date;
  freezeTime: Date;
  finishedAt: Date;
  buildHash: string;
  statementsCovered: number | null;
  statementsTotal: number | null;
  changestatementsCovered: number | null;
  changestatementsTotal: number | null;
  durationMs: number | null;
}) {
  return {
    id: row.id,
    provider: row.provider,
    repoID: row.repoID,
    subject: row.subject,
    subjectID: row.subjectID,
    sha: row.subjectID,
    title: row.title,
    description: row.description,
    status: row.status,
    artifactSize: row.artifactSize,
    createdBy: row.createdBy,
    createdAt: row.createdAt.toISOString(),
    freezeTime: row.freezeTime.toISOString(),
    finishedAt: row.finishedAt.toISOString(),
    buildHash: row.buildHash,
    statementsCovered: row.statementsCovered,
    statementsTotal: row.statementsTotal,
    changestatementsCovered: row.changestatementsCovered,
    changestatementsTotal: row.changestatementsTotal,
    durationMs: row.durationMs,
  };
}

async function resolveReportHtmlDistDir() {
  const candidates = [
    process.env.CANYON_REPORT_HTML_DIST,
    resolve(process.cwd(), "node_modules/@canyonjs/report-html/dist"),
    resolve(process.cwd(), "../node_modules/@canyonjs/report-html/dist"),
    resolve(process.cwd(), "packages/report-html/dist"),
    resolve(process.cwd(), "../packages/report-html/dist"),
  ].filter((item): item is string => Boolean(item));

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // try next candidate
    }
  }

  throw new Error(
    "report-html dist not found, please install @canyonjs/report-html or build packages/report-html",
  );
}

function getRefShaBySubject(subject: "commit" | "compare", subjectID: string) {
  if (subject === "commit") return subjectID;
  const headSha = subjectID.split("...")[1];
  if (!headSha) {
    throw new Error("invalid compare subjectID, expected baseSha...headSha");
  }
  return headSha;
}

function toCoverageMapRecord(mapResult: unknown): Record<string, Record<string, unknown>> {
  if (!mapResult || typeof mapResult !== "object" || Array.isArray(mapResult)) {
    throw new Error("invalid coverage map result");
  }
  return mapResult as Record<string, Record<string, unknown>>;
}

function normalizeReportFilePath(inputPath: string) {
  const withForwardSlash = inputPath.replace(/\\/g, "/");
  const withoutLeading = withForwardSlash.replace(/^\.?\//, "");
  return withoutLeading;
}

async function buildSnapshotReportDataScript(args: {
  provider: string;
  repoID: string;
  subject: "commit" | "compare";
  subjectID: string;
  buildTarget?: string;
  freezeTime: Date;
  coverageMap: Record<string, Record<string, unknown>>;
}) {
  const scm = getScm(args.provider);
  if (!scm) {
    throw new Error(`scm adapter not configured for provider: ${args.provider}`);
  }

  const refSha = getRefShaBySubject(args.subject, args.subjectID);
  const filePaths = Object.keys(args.coverageMap);
  const sourceMap = await scm.getSourceFiles(args.repoID, refSha, filePaths);

  const files = filePaths.map((filePath) => {
    const fileCoverage = args.coverageMap[filePath] || {};
    const sourceFromMap = typeof fileCoverage.source === "string" ? fileCoverage.source : undefined;
    const source = sourceFromMap ?? sourceMap.get(filePath) ?? "";
    const normalizedPath = normalizeReportFilePath(
      typeof fileCoverage.path === "string" ? fileCoverage.path : filePath,
    );
    return {
      ...fileCoverage,
      path: normalizedPath,
      source,
      statementMap:
        fileCoverage.statementMap &&
        typeof fileCoverage.statementMap === "object" &&
        !Array.isArray(fileCoverage.statementMap)
          ? fileCoverage.statementMap
          : {},
      fnMap:
        fileCoverage.fnMap && typeof fileCoverage.fnMap === "object" && !Array.isArray(fileCoverage.fnMap)
          ? fileCoverage.fnMap
          : {},
      branchMap:
        fileCoverage.branchMap &&
        typeof fileCoverage.branchMap === "object" &&
        !Array.isArray(fileCoverage.branchMap)
          ? fileCoverage.branchMap
          : {},
      s: fileCoverage.s && typeof fileCoverage.s === "object" && !Array.isArray(fileCoverage.s)
        ? fileCoverage.s
        : {},
      f: fileCoverage.f && typeof fileCoverage.f === "object" && !Array.isArray(fileCoverage.f)
        ? fileCoverage.f
        : {},
      b: fileCoverage.b && typeof fileCoverage.b === "object" && !Array.isArray(fileCoverage.b)
        ? fileCoverage.b
        : {},
      diff:
        fileCoverage.diff && typeof fileCoverage.diff === "object" && !Array.isArray(fileCoverage.diff)
          ? fileCoverage.diff
          : { additions: [], deletions: [] },
    };
  });

  const coverageByPath = files.reduce(
    (acc, item) => {
      acc[item.path] = item;
      return acc;
    },
    {} as Record<string, Record<string, unknown>>,
  );

  const diffAdditions = files
    .map((item) => {
      const diffObj =
        item.diff && typeof item.diff === "object" && !Array.isArray(item.diff) ? item.diff : {};
      const additionsRaw = (diffObj as { additions?: unknown }).additions;
      const additions = Array.isArray(additionsRaw)
        ? additionsRaw.filter((line): line is number => typeof line === "number")
        : [];
      return { path: item.path, additions };
    })
    .filter((item) => item.additions.length > 0);

  const summary = genSummaryMapByCoverageMap(
    coverageByPath as unknown as Record<string, any>,
    diffAdditions,
  );
  const reportData = {
    type: "istanbuljs",
    reportPath: "coverage/index.html",
    version: "1.0.0",
    generatedAt: new Date().toISOString(),
    freezeTime: args.freezeTime.toISOString(),
    watermarks: {
      bytes: [50, 80],
      statements: [50, 80],
      branches: [50, 80],
      functions: [50, 80],
      lines: [50, 80],
    },
    summary,
    // report-html dist 会做 path.replace(`${instrumentCwd}/`, "")；不能给空字符串。
    instrumentCwd: "__canyon_snapshot__",
    subject: args.subject,
    subjectID: args.subjectID,
    buildTarget: args.buildTarget ?? "",
    files,
  };

  const compressed = gzipSync(Buffer.from(JSON.stringify(reportData), "utf8")).toString("base64");
  const metrics = calcSnapshotMetricsFromFiles(files);
  return {
    reportDataScript: `window.reportData = '${compressed}';`,
    metrics,
  };
}

function calcSnapshotMetricsFromFiles(files: Array<Record<string, unknown>>) {
  let statementsTotal = 0;
  let statementsCovered = 0;
  let changestatementsTotal = 0;
  let changestatementsCovered = 0;

  for (const file of files) {
    const statementMap =
      file.statementMap && typeof file.statementMap === "object" && !Array.isArray(file.statementMap)
        ? (file.statementMap as Record<string, unknown>)
        : {};
    const s =
      file.s && typeof file.s === "object" && !Array.isArray(file.s)
        ? (file.s as Record<string, unknown>)
        : {};
    const diff =
      file.diff && typeof file.diff === "object" && !Array.isArray(file.diff)
        ? (file.diff as Record<string, unknown>)
        : {};
    const additionsRaw = diff.additions;
    const additions = Array.isArray(additionsRaw)
      ? additionsRaw.filter((line): line is number => typeof line === "number")
      : [];
    const additionsSet = new Set(additions);
    const impactedStatementIDs = new Set<string>();

    for (const [statementID, statementNode] of Object.entries(statementMap)) {
      statementsTotal += 1;
      const count = Number(s[statementID] ?? 0);
      if (Number.isFinite(count) && count > 0) statementsCovered += 1;

      if (additionsSet.size === 0) continue;
      if (!statementNode || typeof statementNode !== "object") continue;
      const startLine = Number((statementNode as { start?: { line?: number } }).start?.line);
      const endLine = Number((statementNode as { end?: { line?: number } }).end?.line);
      if (!Number.isFinite(startLine) || !Number.isFinite(endLine)) continue;
      for (const line of additionsSet) {
        if (line >= startLine && line <= endLine) {
          impactedStatementIDs.add(statementID);
          break;
        }
      }
    }

    changestatementsTotal += impactedStatementIDs.size;
    for (const statementID of impactedStatementIDs) {
      const count = Number(s[statementID] ?? 0);
      if (Number.isFinite(count) && count > 0) changestatementsCovered += 1;
    }
  }

  return {
    statementsCovered,
    statementsTotal,
    changestatementsCovered,
    changestatementsTotal,
  };
}

async function buildReportHtmlArtifactZip(reportDataScript: string) {
  const distDir = await resolveReportHtmlDistDir();
  const tempRoot = await mkdtemp(join(tmpdir(), "canyon-snapshot-"));
  const tempDist = join(tempRoot, "dist");
  try {
    await cp(distDir, tempDist, { recursive: true });
    await writeFile(join(tempDist, "data", "report-data.js"), reportDataScript, "utf8");
    const AdmZip = require("adm-zip");
    const zip = new AdmZip();
    zip.addLocalFolder(tempDist);
    return zip.toBuffer();
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
}

async function buildSnapshotArtifact(args: {
  id: number;
  provider: string;
  repoID: string;
  subject: "commit" | "compare";
  subjectID: string;
  buildTarget?: string;
  freezeTime: Date;
}) {
  const mapResult = await Promise.race([
    getMapBySubject({
      provider: args.provider,
      repoID: args.repoID,
      subject: args.subject,
      subjectID: args.subjectID,
      buildTarget: args.buildTarget ?? "",
    }),
    (async () => {
      await sleep(SNAPSHOT_TIMEOUT_MS);
      throw new Error(SNAPSHOT_TIMEOUT_MESSAGE);
    })(),
  ]);

  if (typeof mapResult === "object" && "success" in mapResult && mapResult.success === false) {
    throw new Error((mapResult as { message?: string }).message ?? "failed to build coverage map");
  }

  const coverageMap = toCoverageMapRecord(mapResult);
  const reportDataResult = await buildSnapshotReportDataScript({
    provider: args.provider,
    repoID: args.repoID,
    subject: args.subject,
    subjectID: args.subjectID,
    buildTarget: args.buildTarget,
    freezeTime: args.freezeTime,
    coverageMap,
  });
  const artifactZip = await buildReportHtmlArtifactZip(reportDataResult.reportDataScript);
  const buildHash = createHash("sha256").update(reportDataResult.reportDataScript).digest("hex");

  return {
    artifactZip,
    artifactSize: artifactZip.byteLength,
    buildHash,
    metrics: reportDataResult.metrics,
  };
}

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
  const body = c.req.valid("json") as { buildHash?: string | string[] };
  const requestedBuildHashes = Array.from(
    new Set(
      (Array.isArray(body?.buildHash) ? body.buildHash : body?.buildHash ? [body.buildHash] : [])
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
    ),
  );

  const selectedCoverages =
    requestedBuildHashes.length > 0
      ? await prisma.coverage.findMany({
          where: { buildHash: { in: requestedBuildHashes } },
          orderBy: { createdAt: "asc" },
          select: { id: true, buildHash: true },
        })
      : await prisma.coverage.findMany({
          where: { createdAt: { lt: expiredBefore } },
          orderBy: { createdAt: "asc" },
          take: BATCH_SIZE,
          select: { id: true, buildHash: true },
        });

  if (selectedCoverages.length === 0) {
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

  const coverageIDs = selectedCoverages.map((item: { id: string }) => item.id);
  const candidateBuildHashes = [
    ...new Set(selectedCoverages.map((item: { buildHash: string }) => item.buildHash)),
  ];

  let deletableBuildHashes = candidateBuildHashes;
  if (requestedBuildHashes.length === 0) {
    // 仅清理“同 buildHash 全部超过 30 天”的关联数据，避免误删仍有新数据的 buildHash
    const stillActiveRows = await prisma.coverage.findMany({
      where: {
        buildHash: { in: candidateBuildHashes },
        createdAt: { gte: expiredBefore },
      },
      select: { buildHash: true },
      distinct: ["buildHash"],
    });
    const stillReferencedBuildHashes = new Set(
      stillActiveRows.map((row: { buildHash: string }) => row.buildHash),
    );
    deletableBuildHashes = candidateBuildHashes.filter(
      (buildHash) => !stillReferencedBuildHashes.has(buildHash),
    );
  }

  const deletedCoverage = await prisma.coverage.deleteMany({
    where: { id: { in: coverageIDs } },
  });

  if (deletableBuildHashes.length === 0) {
    return c.json({
      success: true,
      expiredBefore: expiredBefore.toISOString(),
      batchSize: BATCH_SIZE,
      selectedCoverageCount: selectedCoverages.length,
      deletedCoverageCount: deletedCoverage.count,
      deletedBuildHashCount: 0,
      deletedCoverageHitCount: 0,
      deletedCoverageMapRelationCount: 0,
    });
  }

  // 删除 hit + relation
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
    selectedCoverageCount: selectedCoverages.length,
    deletedCoverageCount: deletedCoverage.count,
    deletedBuildHashCount: deletableBuildHashes.length,
    deletedCoverageHitCount: deletedCoverageHit.count,
    deletedCoverageMapRelationCount: deletedCoverageMapRelation.count,
  });
});

coverageApi.openapi(coverageCleanupOrphanMapsRoute, async (c) => {
  const BATCH_SIZE = 100;

  const orphanCoverageMapRows = (await prisma.$queryRaw<
    Array<{ hash: string }>
  >`WITH to_delete AS (
      SELECT cm.hash
      FROM canyon_next_coverage_map cm
      WHERE NOT EXISTS (
        SELECT 1
        FROM canyon_next_coverage_map_relation r
        WHERE (r.coverage_map_hash || '|' || r.file_content_hash) = cm.hash
      )
      LIMIT ${BATCH_SIZE}
    )
    DELETE FROM canyon_next_coverage_map cm
    USING to_delete td
    WHERE cm.hash = td.hash
    RETURNING cm.hash;`) as Array<{ hash: string }>;

  const orphanSourceMapRows = (await prisma.$queryRaw<
    Array<{ hash: string }>
  >`WITH to_delete AS (
      SELECT sm.hash
      FROM canyon_next_coverage_source_map sm
      WHERE NOT EXISTS (
        SELECT 1
        FROM canyon_next_coverage_map_relation r
        WHERE r.source_map_hash = sm.hash
      )
      LIMIT ${BATCH_SIZE}
    )
    DELETE FROM canyon_next_coverage_source_map sm
    USING to_delete td
    WHERE sm.hash = td.hash
    RETURNING sm.hash;`) as Array<{ hash: string }>;

  return c.json({
    success: true,
    batchSize: BATCH_SIZE,
    deletedCoverageMapCount: orphanCoverageMapRows.length,
    deletedCoverageSourceMapCount: orphanSourceMapRows.length,
  });
});

coverageApi.openapi(snapshotCreateRoute, async (c) => {
  const body = c.req.valid("json");
  const subject = body.subject ?? "commit";
  const subjectID = body.subjectID ?? body.sha;
  if (!subjectID) {
    return c.json({ success: false, message: "subjectID is required" }, 400);
  }
  const resolvedRepoID = await resolveRepoIDForCoverage(body.repoID);

  const freezeTime = new Date();
  const createdBy = body.createdBy ?? c.req.header("x-user-id") ?? "system";
  const created = await prisma.coverageSnapshot.create({
    data: {
      provider: body.provider,
      repoID: resolvedRepoID,
      subject,
      subjectID,
      title: body.title,
      description: body.description,
      freezeTime,
      status: "generating",
      artifactZip: Buffer.alloc(0),
      artifactSize: 0,
      createdBy,
      finishedAt: freezeTime,
      buildHash: "pending",
      scene: body.buildTarget ? { buildTarget: body.buildTarget } : {},
      statementsCovered: null,
      statementsTotal: null,
      changestatementsCovered: null,
      changestatementsTotal: null,
      durationMs: null,
    },
    select: {
      id: true,
      status: true,
      provider: true,
      repoID: true,
      subject: true,
      subjectID: true,
      createdAt: true,
    },
  });

  void (async () => {
    try {
      const startedAt = Date.now();
      const artifact = await buildSnapshotArtifact({
        id: created.id,
        provider: created.provider,
        repoID: created.repoID,
        subject: created.subject as "commit" | "compare",
        subjectID: created.subjectID,
        buildTarget: body.buildTarget,
        freezeTime,
      });
      await prisma.coverageSnapshot.update({
        where: { id: created.id },
        data: {
          status: "completed",
          artifactZip: artifact.artifactZip,
          artifactSize: artifact.artifactSize,
          buildHash: artifact.buildHash,
          statementsCovered: artifact.metrics.statementsCovered,
          statementsTotal: artifact.metrics.statementsTotal,
          changestatementsCovered: artifact.metrics.changestatementsCovered,
          changestatementsTotal: artifact.metrics.changestatementsTotal,
          durationMs: Date.now() - startedAt,
          finishedAt: new Date(),
        },
      });
    } catch (error: unknown) {
      const status = isSnapshotTimeoutError(error) ? "timeout" : "failed";
      const errorMessage = stringifyUnknownError(error);
      const durationMs = Date.now() - freezeTime.getTime();
      console.error("[snapshot:create] generation failed", {
        snapshotID: created.id,
        provider: created.provider,
        repoID: created.repoID,
        subject: created.subject,
        subjectID: created.subjectID,
        status,
        error: errorMessage,
      });
      await prisma.coverageSnapshot.update({
        where: { id: created.id },
        data: {
          status,
          description: [body.description, `snapshot failed: ${errorMessage}`].filter(Boolean).join("\n"),
          durationMs,
          finishedAt: new Date(),
        },
      });
    }
  })();

  return c.json({
    success: true,
    data: {
      id: created.id,
      status: created.status,
      provider: created.provider,
      repoID: created.repoID,
      subject: created.subject,
      subjectID: created.subjectID,
      createdAt: created.createdAt.toISOString(),
    },
  });
});

coverageApi.openapi(snapshotListRoute, async (c) => {
  await markExpiredGeneratingSnapshots();
  const { provider, repoID, subject, page, pageSize } = c.req.valid("query");
  const where = {
    provider,
    repoID,
    ...(subject ? { subject } : {}),
  };

  const [total, rows] = await prisma.$transaction([
    prisma.coverageSnapshot.count({ where }),
    prisma.coverageSnapshot.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        provider: true,
        repoID: true,
        subject: true,
        subjectID: true,
        title: true,
        description: true,
        status: true,
        artifactSize: true,
        createdBy: true,
        createdAt: true,
        freezeTime: true,
        finishedAt: true,
        buildHash: true,
        statementsCovered: true,
        statementsTotal: true,
        changestatementsCovered: true,
        changestatementsTotal: true,
        durationMs: true,
      },
    }),
  ]);

  return c.json({
    data: rows.map(normalizeSnapshotRow),
    total,
  });
});

coverageApi.openapi(snapshotGetRoute, async (c) => {
  await markExpiredGeneratingSnapshots();
  const { id } = c.req.valid("param");
  const row = await prisma.coverageSnapshot.findUnique({
    where: { id },
    select: {
      id: true,
      provider: true,
      repoID: true,
      subject: true,
      subjectID: true,
      title: true,
      description: true,
      status: true,
      artifactSize: true,
      createdBy: true,
      createdAt: true,
      freezeTime: true,
      finishedAt: true,
      buildHash: true,
      statementsCovered: true,
      statementsTotal: true,
      changestatementsCovered: true,
      changestatementsTotal: true,
      durationMs: true,
    },
  });
  if (!row) return c.json({ success: false, message: "snapshot not found" }, 404);
  return c.json(normalizeSnapshotRow(row));
});

coverageApi.openapi(snapshotUpdateRoute, async (c) => {
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");
  const row = await prisma.coverageSnapshot.findUnique({ where: { id }, select: { id: true } });
  if (!row) return c.json({ success: false, message: "snapshot not found" }, 404);

  const updated = await prisma.coverageSnapshot.update({
    where: { id },
    data: {
      title: body.title,
      description: body.description,
    },
    select: {
      id: true,
      provider: true,
      repoID: true,
      subject: true,
      subjectID: true,
      title: true,
      description: true,
      status: true,
      artifactSize: true,
      createdBy: true,
      createdAt: true,
      freezeTime: true,
      finishedAt: true,
      buildHash: true,
      statementsCovered: true,
      statementsTotal: true,
      changestatementsCovered: true,
      changestatementsTotal: true,
      durationMs: true,
    },
  });

  return c.json({ success: true, data: normalizeSnapshotRow(updated) });
});

coverageApi.openapi(snapshotDeleteRoute, async (c) => {
  const { id } = c.req.valid("param");
  const row = await prisma.coverageSnapshot.findUnique({ where: { id }, select: { id: true } });
  if (!row) return c.json({ success: false, message: "snapshot not found" }, 404);
  await prisma.coverageSnapshot.delete({ where: { id } });
  return c.json({ success: true });
});

coverageApi.openapi(snapshotDownloadRoute, async (c) => {
  await markExpiredGeneratingSnapshots();
  const { id } = c.req.valid("param");
  const row = await prisma.coverageSnapshot.findUnique({
    where: { id },
    select: { id: true, artifactZip: true, status: true },
  });
  if (!row) return c.json({ success: false, message: "snapshot not found" }, 404);
  if (row.status !== "completed") {
    return c.json({ success: false, message: `snapshot status is ${row.status}` }, 409);
  }

  c.header("Content-Type", "application/octet-stream");
  c.header("Content-Disposition", `attachment; filename="snapshot-${row.id}.zip"`);
  return c.body(row.artifactZip);
});

export default coverageApi;

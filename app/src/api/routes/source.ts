import { createRoute, z } from "@hono/zod-openapi";
import { ProviderQueryParam, ProviderSchema } from "@/shared/schemas/provider.ts";
import { OpenAPIHono } from "@hono/zod-openapi";
import { prisma } from "@/api/lib/prisma.ts";
import { ensureCommitFromScm, toCommitId } from "@/api/lib/commit.ts";
import { buildCompareUrl } from "@/api/lib/commit-url.ts";
import {
  fetchExternalUserProfilesByEmails,
  normalizeEmail,
} from "@/api/lib/external-user-profile.ts";
import {getNewScm, getScm} from "@/api/lib/scm.ts";
import { resolveRepoAndRef } from "@/api/lib/source/get-file-content.ts";
import { diffLine } from "@/api/lib/source/diff-line.ts";

const SourceQuerySchema = z.object({
  repo_id: z.string().openapi({ param: { name: "repo_id", in: "query" } }),
  provider: ProviderQueryParam,
  path: z.string().openapi({ param: { name: "path", in: "query" } }),
  ref: z
    .string()
    .optional()
    .openapi({ param: { name: "ref", in: "query" } }),
  sha: z
    .string()
    .optional()
    .openapi({ param: { name: "sha", in: "query" } }),
  compareID: z
    .string()
    .optional()
    .openapi({ param: { name: "compareID", in: "query" } }),
  subject: z
    .string()
    .optional()
    .openapi({ param: { name: "subject", in: "query" } }),
  subjectID: z
    .string()
    .optional()
    .openapi({ param: { name: "subjectID", in: "query" } }),
});

const sourceRoute = createRoute({
  method: "get",
  path: "/",
  summary: "获取文件内容",
  description:
    "从 GitLab/GitHub 获取指定仓库、路径、ref 下的文件内容。支持 ref/sha、compareID、subject=pull+subjectID 解析。返回 Base64 编码的 content。",
  tags: ["源码"],
  request: { query: SourceQuerySchema },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            content: z.string().nullable().describe("Base64 编码的文件内容"),
          }),
        },
      },
      description: "成功",
    },
    400: { description: "参数错误" },
    404: { description: "文件不存在" },
    502: { description: "SCM 请求失败" },
  },
});

const projectRoute = createRoute({
  method: "get",
  path: "/project",
  summary: "获取项目信息",
  description: "根据 path 获取 GitLab/GitHub 项目信息。",
  tags: ["源码"],
  request: {
    query: z.object({
      path: z.string().openapi({ param: { name: "path", in: "query" } }),
      provider: ProviderQueryParam.optional(),
    }),
  },
  responses: {
    200: { description: "项目信息" },
    400: { description: "参数错误" },
  },
});

const diffGetRoute = createRoute({
  method: "get",
  path: "/diff",
  summary: "获取 Diff 列表",
  description: "根据 repoID、provider 获取 diff 记录列表（累积分析等）。",
  tags: ["源码"],
  request: {
    query: z.object({
      repoID: z.string().openapi({ param: { name: "repoID", in: "query" } }),
      provider: z.string().openapi({ param: { name: "provider", in: "query" } }),
    }),
  },
  responses: { 200: { description: "diff 列表" } },
});

const diffPostRoute = createRoute({
  method: "post",
  path: "/diff",
  summary: "创建 Diff",
  description: "创建累积分析记录，subjectID 格式为 commit1...commit2。",
  tags: ["源码"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            repoID: z.string(),
            provider: z.string(),
            subject: z.string(),
            subjectID: z.string(),
          }),
        },
      },
    },
  },
  responses: { 200: { description: "创建成功" }, 400: { description: "参数错误" } },
});

const commitPostRoute = createRoute({
  method: "post",
  path: "/commit",
  summary: "创建 Commit",
  description:
    "通过 provider、repoID、sha 创建 commit 记录。若已存在则跳过；否则从 SCM（GitLab/GitHub）拉取 commit 实体并存储。id 格式：provider-repoID-sha。",
  tags: ["源码"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            provider: ProviderSchema.describe("SCM 提供商"),
            repoID: z.string().describe("仓库 ID，如 GitLab project id 或 org/repo"),
            sha: z.string().describe("Commit SHA"),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            id: z.string().optional().describe("Commit 记录 id，格式 provider-repoID-sha"),
          }),
        },
      },
      description: "成功",
    },
    400: { description: "参数错误" },
    502: { description: "SCM 未配置或请求失败" },
  },
});

const diffDeleteRoute = createRoute({
  method: "delete",
  path: "/diff",
  summary: "删除 Diff",
  description: "根据 subjectID、subject、repoID、provider 删除 diff 记录。",
  tags: ["源码"],
  request: {
    query: z.object({
      subjectID: z.string().openapi({ param: { name: "subjectID", in: "query" } }),
      subject: z.string().openapi({ param: { name: "subject", in: "query" } }),
      repoID: z.string().openapi({ param: { name: "repoID", in: "query" } }),
      provider: z.string().openapi({ param: { name: "provider", in: "query" } }),
    }),
  },
  responses: { 200: { description: "删除成功" } },
});

const sourceApi = new OpenAPIHono();

sourceApi.openapi(sourceRoute, async (c) => {
  const q = c.req.valid("query");
  const { repo_id, provider, path } = q;

  if (!repo_id || !path) {
    return c.json({ content: null });
  }
  if (!q.ref && !q.sha && !q.compareID && !(q.subject === "pull" && q.subjectID)) {
    return c.json({ content: null });
  }

  const resolved = await resolveRepoAndRef({
    repoID: repo_id,
    path,
    provider,
    ref: q.ref,
    sha: q.sha,
    compareID: q.compareID,
    subject: q.subject,
    subjectID: q.subjectID,
  });
  if (!resolved) return c.json({ content: null });

  const scmRepoId = resolved.repoID.includes(":")
    ? resolved.repoID.slice(resolved.repoID.indexOf(":") + 1)
    : resolved.repoID;
  const scm = getScm(provider);
  if (!scm) return c.json({ error: "SCM 未配置" }, 502);

  try {
    const content = await scm.getFileContent(scmRepoId, path, resolved.ref);
    const encoded = Buffer.from(content, "utf-8").toString("base64");
    return c.json({ content: encoded });
  } catch (err: unknown) {
    const status =
      err && typeof err === "object" && "response" in err
        ? (err as { response?: { status?: number } }).response?.status
        : undefined;
    const msg = err instanceof Error ? err.message : String(err);
    if (status === 404 || msg.includes("404") || msg.includes("Not Found")) {
      return c.json({ content: null });
    }
    return c.json({ error: "SCM 请求失败", detail: msg }, 502);
  }
});

sourceApi.openapi(projectRoute, async (c) => {
  const { path, provider = "gitlab" } = c.req.valid("query");
  if (!path) return c.json({ path, project: null });
  const scm = getNewScm(provider);
  if (!scm) return c.json({ path, project: null });
  try {
    const info = await scm.getRepoInfo(path);
    return c.json({ path, project: info });
  } catch {
    return c.json({ path, project: null });
  }
});

sourceApi.openapi(diffGetRoute, async (c) => {
  const { repoID, provider } = c.req.valid("query");
  if (!repoID || !provider) return c.json({ data: [], total: 0 });

  const diffs = await prisma.diff.findMany({
    where: { provider, repoID },
    select: {
      id: true,
      provider: true,
      repoID: true,
      from: true,
      to: true,
      subject: true,
      subjectID: true,
      path: true,
      additions: true,
      deletions: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const recordsMap = new Map<
    string,
    {
      id: string;
      provider: string;
      repoID: string;
      from: string;
      to: string;
      subject: string;
      subjectID: string;
      createdAt: Date;
      files: Array<{ path: string; additions: number[]; deletions: number[] }>;
      buildTargets: string[];
    }
  >();

  for (const d of diffs) {
    const key = `${d.subjectID}_${d.subject}`;
    if (!recordsMap.has(key)) {
      recordsMap.set(key, {
        id: d.id,
        provider: d.provider,
        repoID: d.repoID,
        from: d.from,
        to: d.to,
        subject: d.subject,
        subjectID: d.subjectID,
        createdAt: d.createdAt,
        files: [],
        buildTargets: [],
      });
    } else {
      const row = recordsMap.get(key)!;
      if (d.createdAt < row.createdAt) {
        row.createdAt = d.createdAt;
      }
    }
    recordsMap.get(key)!.files.push({
      path: d.path,
      additions: (d.additions as number[]) || [],
      deletions: (d.deletions as number[]) || [],
    });
  }

  const allCommits = new Set<string>();
  for (const r of recordsMap.values()) {
    allCommits.add(r.from);
    allCommits.add(r.to);
  }

  const commitIds = Array.from(allCommits).map((sha) => toCommitId(provider, repoID, sha));
  const commits = await prisma.commit.findMany({
    where: { id: { in: commitIds } },
    select: { id: true, content: true },
  });

  const commitInfoMap = new Map<
    string,
    {
      commitMessage?: string;
      authorName?: string;
      authorEmail?: string;
      createdAt?: string;
      avatar?: string;
    }
  >();
  for (const c of commits) {
    const content = c.content as Record<string, unknown> | null;
    const sha = (content?.sha as string) ?? c.id.replace(`${provider}-${repoID}-`, "");
    commitInfoMap.set(sha, {
      commitMessage: content?.commitMessage as string,
      authorName: content?.authorName as string,
      authorEmail: content?.authorEmail as string,
      createdAt: content?.createdAt as string,
    });
  }

  const uniqueEmails = Array.from(
    new Set(
      Array.from(commitInfoMap.values())
        .map((item) => normalizeEmail(item.authorEmail || ""))
        .filter((email) => email.length > 0),
    ),
  );
  const profileMap = await fetchExternalUserProfilesByEmails(uniqueEmails);

  for (const [sha, info] of commitInfoMap.entries()) {
    const email = normalizeEmail(info.authorEmail || "");
    if (!email) continue;
    const profile = profileMap.get(email);
    if (!profile) continue;
    commitInfoMap.set(sha, {
      ...info,
      authorName: profile.nickname,
      authorEmail: profile.email,
      avatar: profile.avatar,
    });
  }

  const toCommits = new Set(Array.from(recordsMap.values()).map((r) => r.to));
  const coverages = await prisma.coverage.findMany({
    where: { provider, repoID, sha: { in: Array.from(toCommits) } },
    select: { sha: true, buildTarget: true },
  });
  const buildTargetsMap = new Map<string, Set<string>>();
  for (const cov of coverages) {
    if (!buildTargetsMap.has(cov.sha)) buildTargetsMap.set(cov.sha, new Set());
    if (cov.buildTarget?.trim()) buildTargetsMap.get(cov.sha)!.add(cov.buildTarget);
  }

  const repoRow = await prisma.repo.findFirst({
    where: {
      OR: [{ id: repoID }, { id: { contains: repoID } }, { pathWithNamespace: repoID }],
    },
    select: { pathWithNamespace: true },
  });
  const pathWithNamespaceForCompare = repoRow?.pathWithNamespace ?? null;

  const sorted = Array.from(recordsMap.values()).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );

  const data = sorted.map((r) => {
    const buildTargets = Array.from(buildTargetsMap.get(r.to) || []);
    const fromCommit = commitInfoMap.get(r.from);
    const toCommit = commitInfoMap.get(r.to);
    return {
      id: r.id,
      provider: r.provider,
      repoID: r.repoID,
      base: r.from,
      head: r.to,
      subject: r.subject,
      subjectID: r.subjectID,
      createdAt: r.createdAt.toISOString(),
      files: r.files,
      buildTargets,
      compareUrl: pathWithNamespaceForCompare
        ? buildCompareUrl(r.provider, pathWithNamespaceForCompare, r.from, r.to)
        : null,
      baseCommit: fromCommit || null,
      headCommit: toCommit || null,
    };
  });

  return c.json({ data, total: data.length });
});

sourceApi.openapi(commitPostRoute, async (c) => {
  const body = c.req.valid("json");
  const { provider, repoID, sha } = body;

  if (!provider || !repoID || !sha) {
    return c.json({ success: false, error: "缺少必要参数：provider、repoID、sha" }, 400);
  }

  const scm = getScm(provider);
  if (!scm) {
    return c.json({ success: false, error: "SCM 未配置" }, 502);
  }

  try {
    await ensureCommitFromScm(prisma, scm, provider, repoID, sha);
    const id = toCommitId(provider, repoID, sha);
    return c.json({ success: true, id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ success: false, error: "SCM 请求失败", detail: msg }, 502);
  }
});

sourceApi.openapi(diffPostRoute, async (c) => {
  const body = c.req.valid("json");
  const { repoID, provider, subjectID, subject } = body;

  const parts = subjectID.split("...");
  if (parts.length !== 2) {
    return c.json({ error: "subjectID 格式错误，应为 commit1...commit2" }, 400);
  }
  const [fromSha, toSha] = parts.map((s) => s.trim());
  if (!fromSha || !toSha) {
    return c.json({ error: "subjectID 格式错误，from 和 to 不能为空" }, 400);
  }

  const scm = getScm(provider);
  for (const s of [fromSha, toSha]) {
    await ensureCommitFromScm(prisma, scm, provider, repoID, s);
  }

  await prisma.diff.deleteMany({
    where: { provider, repoID, subjectID, subject },
  });

  if (!scm) return c.json({ error: "SCM 未配置" }, 502);

  const diffResult = await diffLine(scm, repoID, fromSha, toSha);
  const data = diffResult.map((item) => ({
    id: `${provider}|${repoID}|${subject}|${subjectID}|${item.path}`,
    provider,
    repoID,
    from: fromSha,
    to: toSha,
    subjectID,
    subject,
    path: item.path,
    additions: item.additions,
    deletions: item.deletions,
  }));

  await prisma.diff.createMany({ data, skipDuplicates: true });
  return c.json(data);
});

sourceApi.openapi(diffDeleteRoute, async (c) => {
  const { subjectID, subject, repoID, provider } = c.req.valid("query");
  if (!subjectID || !subject || !repoID || !provider) {
    return c.json({ success: false, message: "缺少必要参数" });
  }
  await prisma.diff.deleteMany({
    where: { provider, repoID, subjectID, subject },
  });
  return c.json({ success: true });
});

export default sourceApi;

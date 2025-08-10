import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import axios from "axios";

type RouteParams = {
  provider: string;
  repoID: string;
};

export async function GET(
  request: Request,
  { params }: { params: Promise<RouteParams> }
) {
  const { provider, repoID } = await params;
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page") ?? "1");
  const pageSize = Number(url.searchParams.get("pageSize") ?? "20");
  const q = (url.searchParams.get("q") ?? "").trim();

  // 1) 以 repoID 作为覆盖数据的 repoID 过滤条件
  const dbRepoId = repoID;

  const [total, coverages] = await Promise.all([
    prisma.coverage.count({ where: { repoID: dbRepoId } }),
    prisma.coverage.findMany({
      where: { repoID: dbRepoId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: { sha: true, provider: true, createdAt: true },
    }),
  ]);

  // 2) 读取配置（直接查表，若表无再返回空）
  const configRows = await prisma.config
    .findMany({ select: { key: true, value: true } })
    .catch(() => [] as { key: string; value: any }[]);
  const cfg: Record<string, any> = {};
  for (const r of configRows) cfg[r.key] = r.value;

  // 3) 从配置拼 GitLab 请求参数
  const baseUrl: string = cfg["git_provider[0].url"] ?? "https://gitlab.com";
  const privateToken: string = cfg["git_provider[0].private_token"] ?? "";
  const pathWithNamespace = repoID.replaceAll("__", "/");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (privateToken) headers["PRIVATE-TOKEN"] = String(privateToken);

  // 4) 并发获取每个 sha 的 commit 详情
  const commitDetails = await Promise.all(
    coverages.map(async (c: { sha: string }) => {
      try {
        const commitUrl = `${baseUrl.replace(/\/$/, "")}/api/v4/projects/${encodeURIComponent(
          pathWithNamespace
        )}/repository/commits/${encodeURIComponent(c.sha)}`;
        const res = await axios.get(commitUrl, { headers });
        const json = res.data;
        return {
          sha: c.sha,
          message: json?.title || json?.message,
          authorName: json?.author_name,
          authorEmail: json?.author_email,
          committedDate: json?.committed_date,
          raw: json,
        };
      } catch (e: any) {
        return { sha: c.sha, error: String(e?.message || e) };
      }
    })
  );

  // 5) 本地搜索过滤（q 在 message/author/sha）
  const filtered = q
    ? commitDetails.filter((c: any) => {
        const message = c.message || "";
        const authorName = c.authorName || "";
        const sha = c.sha || "";
        const haystack = `${message}\n${authorName}\n${sha}`.toLowerCase();
        return haystack.includes(q.toLowerCase());
      })
    : commitDetails;

  return NextResponse.json({ provider, repoID, page, pageSize, total, commits: filtered });
}



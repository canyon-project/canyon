import axios from "axios";
import { prisma } from "@/api/lib/prisma.ts";
import { getProviderInfra } from "@/api/lib/scm.ts";

export type MergeRequestCompareRefs = {
  iid: string;
  sourceBranch: string;
  targetBranch: string;
  sourceSha: string;
  targetSha: string;
  /** opened 才适合跟当前分支 tip；merged/closed 应使用冻结的 diff_refs SHA */
  state: "opened" | "merged" | "closed";
};

async function resolveGithubRepoPath(repoID: string): Promise<string | null> {
  if (repoID.includes("/")) return repoID;
  const row = await prisma.repo.findFirst({
    where: {
      OR: [{ id: repoID }, { repoID }, { id: { contains: repoID } }],
    },
    select: { pathWithNamespace: true },
  });
  return row?.pathWithNamespace || null;
}

function httpStatus(err: unknown): number | undefined {
  if (err && typeof err === "object" && "response" in err) {
    return (err as { response?: { status?: number } }).response?.status;
  }
  return undefined;
}

/**
 * 从 SCM 拉取 MR/PR，得到源/目标分支及当前 SHA。
 * GitLab：target_branch = base，source_branch = head。
 */
export async function fetchMergeRequestCompareRefs(
  provider: string,
  repoID: string,
  iid: string,
): Promise<MergeRequestCompareRefs> {
  try {
    return await fetchMergeRequestCompareRefsInner(provider, repoID, iid);
  } catch (err) {
    if (err instanceof Error && /^(无法|SCM|GitHub|找不到)/.test(err.message)) {
      throw err;
    }
    if (httpStatus(err) === 404) {
      throw new Error(`找不到 MR/PR !${iid}`);
    }
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`查询 MR/PR !${iid} 失败: ${msg}`);
  }
}

async function fetchMergeRequestCompareRefsInner(
  provider: string,
  repoID: string,
  iid: string,
): Promise<MergeRequestCompareRefs> {
  const { base, token } = getProviderInfra(provider);
  const p = provider.toLowerCase();

  if ((p === "gitlab" || p.startsWith("gitlab_")) && base && token && token !== "-") {
    const url = `${base.replace(/\/$/, "")}/api/v4/projects/${encodeURIComponent(repoID)}/merge_requests/${encodeURIComponent(iid)}`;
    const { data } = await axios.get<{
      iid?: number;
      state?: string;
      source_branch?: string;
      target_branch?: string;
      diff_refs?: { head_sha?: string; base_sha?: string; start_sha?: string };
      sha?: string;
    }>(url, {
      headers: { "PRIVATE-TOKEN": token },
      timeout: 15000,
    });
    const sourceBranch = data.source_branch?.trim() || "";
    const targetBranch = data.target_branch?.trim() || "";
    if (!sourceBranch || !targetBranch) {
      throw new Error(`无法从 MR !${iid} 解析 source/target 分支`);
    }
    const gitlabState = data.state === "merged" ? "merged" : data.state === "opened" ? "opened" : "closed";
    return {
      iid: String(data.iid ?? iid),
      sourceBranch,
      targetBranch,
      sourceSha: data.diff_refs?.head_sha || data.sha || "",
      targetSha: data.diff_refs?.start_sha || data.diff_refs?.base_sha || "",
      state: gitlabState,
    };
  }

  if ((p === "github" || p.startsWith("github_")) && token && token !== "-") {
    const path = await resolveGithubRepoPath(repoID);
    if (!path || !path.includes("/")) {
      throw new Error("GitHub 仓库缺少 owner/repo，无法查询 Pull Request");
    }
    const urlBase = (base?.replace(/\/$/, "") || "https://api.github.com").replace(/\/$/, "");
    const apiRoot = urlBase.includes("api.github.com") ? urlBase : `${urlBase}/api/v3`;
    const url = `${apiRoot}/repos/${path}/pulls/${encodeURIComponent(iid)}`;
    const { data } = await axios.get<{
      number?: number;
      state?: string;
      merged_at?: string | null;
      head?: { ref?: string; sha?: string };
      base?: { ref?: string; sha?: string };
    }>(url, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
      },
      timeout: 15000,
    });
    const sourceBranch = data.head?.ref?.trim() || "";
    const targetBranch = data.base?.ref?.trim() || "";
    if (!sourceBranch || !targetBranch) {
      throw new Error(`无法从 PR #${iid} 解析 base/head 分支`);
    }
    const githubState = data.merged_at ? "merged" : data.state === "open" ? "opened" : "closed";
    return {
      iid: String(data.number ?? iid),
      sourceBranch,
      targetBranch,
      sourceSha: data.head?.sha || "",
      targetSha: data.base?.sha || "",
      state: githubState,
    };
  }

  throw new Error("SCM 未配置，无法查询 Merge Request");
}

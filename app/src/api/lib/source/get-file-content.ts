import axios from "axios";
import { prisma } from "@/api/lib/prisma.ts";
import { getProviderInfra } from "@/api/lib/scm.ts";

/** 从 Cr content 提取 head repoID 和 sha */
function extractHeadFromCr(content: unknown): { headRepoID: string; headSha: string } | null {
  if (!content || typeof content !== "object") return null;
  const c = content as Record<string, unknown>;
  const pr = c.pull_request as Record<string, unknown> | undefined;
  if (pr?.head) {
    const head = pr.head as Record<string, unknown>;
    const repo = head.repo as Record<string, unknown> | undefined;
    const headRepoID = repo?.id != null ? String(repo.id) : "";
    const headSha = (head.sha as string) || (head.ref as string) || "";
    if (headRepoID && headSha) return { headRepoID, headSha };
  }
  const mr = c.merge_request as Record<string, unknown> | undefined;
  if (mr) {
    const diffRefs = mr.diff_refs as { head_sha?: string } | undefined;
    const headSha = diffRefs?.head_sha || (mr.sha as string) || "";
    const sourceProjectId = mr.source_project_id ?? mr.target_project_id;
    const headRepoID = sourceProjectId != null ? String(sourceProjectId) : "";
    if (headRepoID && headSha) return { headRepoID, headSha };
  }
  return null;
}

export interface GetFileContentParams {
  repoID: string;
  path: string;
  provider: string;
  ref?: string;
  sha?: string;
  compareID?: string;
  subject?: string;
  subjectID?: string;
}

/**
 * 解析实际用于拉取文件的 repoID 和 ref
 */
export async function resolveRepoAndRef(params: GetFileContentParams): Promise<{
  repoID: string;
  ref: string;
} | null> {
  const { repoID, ref, sha, compareID, subject, subjectID, provider } = params;
  let actualRepoID = repoID;
  let actualRef = ref ?? sha ?? "";

  if (subject === "pull" && subjectID && provider) {
    const mrId = `${provider}-${repoID}-${subjectID}`;
    const cr = await prisma.mergeRequest.findUnique({ where: { id: mrId } });
    if (!cr?.content) return null;
    const head = extractHeadFromCr(cr.content);
    if (!head) return null;
    actualRepoID = head.headRepoID;
    actualRef = head.headSha;
  }

  if (!actualRef && compareID && provider) {
    const { base, token } = getProviderInfra(provider);
    const p = provider.toLowerCase();
    if ((p === "gitlab" || p.startsWith("gitlab_")) && base && token && token !== "-") {
      const url = `${base}/api/v4/projects/${encodeURIComponent(actualRepoID)}/merge_requests/${encodeURIComponent(compareID)}`;
      const { data } = await axios.get<{ diff_refs?: { head_sha?: string }; sha?: string }>(url, {
        headers: { "PRIVATE-TOKEN": token },
        timeout: 10000,
      });
      actualRef = data?.diff_refs?.head_sha ?? data?.sha ?? "";
    } else if ((p === "github" || p.startsWith("github_")) && token && token !== "-") {
      const [owner, repo] = actualRepoID.includes("/")
        ? actualRepoID.split("/")
        : ["", actualRepoID];
      if (owner && repo) {
        const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${compareID}`;
        const { data } = await axios.get<{ head?: { sha?: string } }>(url, {
          headers: { Authorization: `token ${token}` },
          timeout: 10000,
        });
        actualRef = data?.head?.sha ?? "";
      }
    }
  }

  if (!actualRef) return null;
  return { repoID: actualRepoID, ref: actualRef };
}

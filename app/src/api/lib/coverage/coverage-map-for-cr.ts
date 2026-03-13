import { prisma } from "@/api/lib/prisma.ts";
import { getCoverageMapForCommit } from "@/api/lib/coverage/coverage-map-for-commit.ts";

export interface CoverageMapForCrParams {
  provider: string;
  repoID: string;
  crID: string;
  buildTarget?: string;
  filePath?: string;
  scene?: string;
}

/** 从 Cr content 提取 head repoID 和 head sha（支持 GitHub PR、GitLab MR） */
function extractHeadFromCr(content: unknown): { headRepoID: string; headSha: string } | null {
  if (!content || typeof content !== "object") return null;
  const c = content as Record<string, unknown>;
  // GitHub PR
  const pr = c.pull_request as Record<string, unknown> | undefined;
  if (pr?.head) {
    const head = pr.head as Record<string, unknown>;
    const repo = head.repo as Record<string, unknown> | undefined;
    const headRepoID = repo?.id != null ? String(repo.id) : "";
    const headSha = (head.sha as string) || (head.ref as string) || "";
    if (headRepoID && headSha) return { headRepoID, headSha };
  }
  // GitLab Merge Request
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

/**
 * 按 PR/MR 查询覆盖率 map（subject=pull 或 merge_requests）
 * 从 Cr 表获取 head 信息，再查 head 的 coverage，并与 diff 合并
 */
export async function getCoverageMapForCr(
  params: CoverageMapForCrParams,
): Promise<
  | { success: true; coverage: Record<string, unknown> }
  | { success: false; msg?: string; message?: string }
> {
  const { provider, repoID, crID, buildTarget = "", filePath, scene } = params;

  const mrId = `${provider}-${repoID}-${crID}`;
  const cr = await prisma.mergeRequest.findUnique({ where: { id: mrId } });
  if (!cr?.content) {
    return { success: false, msg: "没找到 MergeRequest" };
  }

  const head = extractHeadFromCr(cr.content);
  if (!head) {
    return { success: false, msg: "无法从 Cr 解析 head repoID 或 head sha" };
  }

  const diffSubject = provider.startsWith("github") ? "pr" : "merge_request";
  const diffs = await prisma.diff.findMany({
    where: {
      subject: diffSubject,
      subjectID: crID,
      repoID: head.headRepoID,
      provider,
    },
  });

  const coverage = await getCoverageMapForCommit({
    provider,
    repoID: head.headRepoID,
    sha: head.headSha,
    buildTarget,
    filePath,
    scene,
  });

  if ("success" in coverage && coverage.success === false) {
    return { success: false, message: coverage.message };
  }

  const cov: Record<string, unknown> = {};
  const covRecord = coverage as Record<string, Record<string, unknown>>;
  for (const [k, item] of Object.entries(covRecord)) {
    const path = (item?.path as string) ?? k;
    const diffItem = diffs.find((d) => d.path === path);
    if (diffItem) {
      cov[k] = {
        ...item,
        diff: {
          additions: diffItem.additions || [],
          deletions: diffItem.deletions || [],
        },
      };
    }
  }

  return { success: true, coverage: cov };
}

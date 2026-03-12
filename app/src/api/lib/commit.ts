import type { PrismaClient } from "@prisma/client";
import type { ScmAdapter } from "@/api/scm/adapter.ts";

/** Commit 表 id 规范：provider-repoID-sha */
export function toCommitId(provider: string, repoID: string, sha: string): string {
  return `${provider}-${repoID}-${sha}`;
}

/**
 * 若 DB 中不存在该 commit，则通过 SCM 拉取 GitLab/GitHub API 的 commit 实体并存储。
 * id 格式：provider-repoID-sha
 * content：完整 commit 实体（含 sha、commitMessage、authorName、authorEmail、createdAt 等）
 */
export async function ensureCommitFromScm(
  prisma: PrismaClient,
  scm: ScmAdapter | null,
  provider: string,
  repoID: string,
  sha: string,
): Promise<void> {
  const id = toCommitId(provider, repoID, sha);
  const existing = await prisma.commit.findUnique({ where: { id } });
  if (existing) return;

  if (!scm) return;

  try {
    const detail = await scm.getCommitDetail(repoID, sha, provider);
    await prisma.commit.create({
      data: { id, content: detail as object },
    });
  } catch {
    // SCM 请求失败时忽略，不阻塞主流程
  }
}

import type { PrismaClient } from "@prisma/client";
import { getNewScm } from "@/api/lib/scm.ts";

/** Commit 表 id 规范：provider-repoID-sha */
export function toCommitId(provider: string, repoID: string, sha: string): string {
  return `${provider}-${repoID}-${sha}`;
}

/**
 * 若 DB 中不存在该 commit，则通过 @canyonjs/git-provider 拉取提交摘要并存储。
 * id 格式：provider-repoID-sha
 */
export async function ensureCommitFromScm(
  prisma: PrismaClient,
  provider: string,
  repoID: string,
  sha: string,
): Promise<void> {
  const id = toCommitId(provider, repoID, sha);
  const existing = await prisma.commit.findUnique({ where: { id } });
  if (existing) return;

  const scm = getNewScm(provider);
  if (!scm) return;

  try {
    const summary = await scm.getCommit(repoID, sha);
    const createdAt = new Date(summary.createdAt);
    await prisma.commit.create({
      data: {
        id,
        sha: summary.sha || sha,
        title: summary.title ?? "",
        authorName: summary.authorName ?? "",
        authorEmail: summary.authorEmail ?? "",
        createdAt: Number.isNaN(createdAt.getTime()) ? new Date() : createdAt,
      },
    });
  } catch {
    // SCM 请求失败时忽略，不阻塞主流程
  }
}

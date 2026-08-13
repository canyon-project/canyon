import { prisma } from "@/api/lib/prisma.ts";
import { ensureCommitFromScm } from "@/api/lib/commit.ts";
import { getNewScm } from "@/api/lib/scm.ts";
import {
  COMPARE_PLACEHOLDER_PATH,
  type CompareSpec,
  parseCompareSubjectID,
  serializeCompareSubjectID,
} from "@/api/lib/compare/identity.ts";
import {
  invalidateCompareResolveCache,
  resolveCompareRefs,
  type ResolvedCompare,
} from "@/api/lib/compare/resolve.ts";

export type EnsuredCompareDiff = ResolvedCompare & {
  files: Array<{ path: string; additions: number[]; deletions: number[] }>;
};

async function persistCompareDiffs(args: {
  provider: string;
  repoID: string;
  subjectID: string;
  fromSha: string;
  toSha: string;
  files: Array<{ path: string; additions: number[]; deletions: number[] }>;
}): Promise<Array<{ path: string; additions: number[]; deletions: number[] }>> {
  const subject = "compare";
  await prisma.diff.deleteMany({
    where: {
      provider: args.provider,
      repoID: args.repoID,
      subject,
      subjectID: args.subjectID,
    },
  });

  const rows =
    args.files.length > 0
      ? args.files
      : [{ path: COMPARE_PLACEHOLDER_PATH, additions: [], deletions: [] }];

  await prisma.diff.createMany({
    data: rows.map((item) => ({
      id: `${args.provider}|${args.repoID}|${subject}|${args.subjectID}|${item.path}`,
      provider: args.provider,
      repoID: args.repoID,
      from: args.fromSha,
      to: args.toSha,
      subjectID: args.subjectID,
      subject,
      path: item.path,
      additions: item.additions,
      deletions: item.deletions,
    })),
    skipDuplicates: true,
  });

  return args.files;
}

/**
 * 解析 Compare 引用，并在 SHA 变化时重拉 diff。
 * Diff.from/to 始终是解析后的 SHA；subjectID 是用户查询的稳定身份。
 */
export async function ensureCompareDiff(args: {
  provider: string;
  repoID: string;
  spec?: CompareSpec;
  subjectID?: string;
  force?: boolean;
}): Promise<EnsuredCompareDiff> {
  const spec = args.spec ?? parseCompareSubjectID(args.subjectID ?? "");
  const subjectID = serializeCompareSubjectID(spec);

  if (args.force) {
    invalidateCompareResolveCache(args.provider, args.repoID, subjectID);
  }

  const resolved = await resolveCompareRefs({
    provider: args.provider,
    repoID: args.repoID,
    spec,
    force: args.force,
  });

  const existing = await prisma.diff.findMany({
    where: {
      provider: args.provider,
      repoID: args.repoID,
      subject: "compare",
      subjectID,
    },
    select: {
      from: true,
      to: true,
      path: true,
      additions: true,
      deletions: true,
    },
  });

  const shaUnchanged =
    existing.length > 0 &&
    existing[0].from === resolved.baseSha &&
    existing[0].to === resolved.headSha;

  if (shaUnchanged && !args.force) {
    return {
      ...resolved,
      files: existing
        .filter((d) => d.path !== COMPARE_PLACEHOLDER_PATH)
        .map((d) => ({
          path: d.path,
          additions: (d.additions as number[]) || [],
          deletions: (d.deletions as number[]) || [],
        })),
    };
  }

  const scm = getNewScm(args.provider);
  if (!scm) {
    throw new Error("SCM 未配置");
  }

  await Promise.all([
    ensureCommitFromScm(prisma, args.provider, args.repoID, resolved.baseSha),
    ensureCommitFromScm(prisma, args.provider, args.repoID, resolved.headSha),
  ]);

  const diffResult = await scm
    .getCompare(args.repoID, resolved.baseSha, resolved.headSha)
    .then((res) => res.changedFiles);

  const files = await persistCompareDiffs({
    provider: args.provider,
    repoID: args.repoID,
    subjectID,
    fromSha: resolved.baseSha,
    toSha: resolved.headSha,
    files: diffResult,
  });

  return { ...resolved, files };
}

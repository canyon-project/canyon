import { getNewScm } from "@/api/lib/scm.ts";
import { fetchMergeRequestCompareRefs } from "@/api/lib/compare/fetch-merge-request.ts";
import type { CompareSpec } from "@/api/lib/compare/identity.ts";
import { isFullSha, serializeCompareSubjectID } from "@/api/lib/compare/identity.ts";

export type ResolvedCompare = {
  spec: CompareSpec;
  subjectID: string;
  baseSha: string;
  headSha: string;
  baseRef: string;
  headRef: string;
};

type CacheEntry = {
  value: ResolvedCompare;
  expiresAt: number;
};

const RESOLVE_TTL_MS = 30_000;
const resolveCache = new Map<string, CacheEntry>();

function cacheKey(provider: string, repoID: string, subjectID: string): string {
  return `${provider}|${repoID}|${subjectID}`;
}

async function resolveRefToSha(
  provider: string,
  repoID: string,
  kind: "sha" | "branch",
  ref: string,
  fallbackSha?: string,
): Promise<string> {
  if (kind === "sha" && isFullSha(ref)) {
    return ref;
  }

  const scm = getNewScm(provider);
  if (!scm) {
    if (fallbackSha && isFullSha(fallbackSha)) return fallbackSha;
    throw new Error("SCM 未配置");
  }

  try {
    const summary = await scm.getCommit(repoID, ref);
    if (summary?.sha) return summary.sha;
  } catch (err) {
    if (fallbackSha && isFullSha(fallbackSha)) return fallbackSha;
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`无法解析 ref「${ref}」: ${msg}`);
  }

  if (fallbackSha && isFullSha(fallbackSha)) return fallbackSha;
  throw new Error(`无法解析 ref「${ref}」为空 SHA`);
}

export async function resolveCompareRefs(args: {
  provider: string;
  repoID: string;
  spec: CompareSpec;
  force?: boolean;
}): Promise<ResolvedCompare> {
  const subjectID = serializeCompareSubjectID(args.spec);
  const key = cacheKey(args.provider, args.repoID, subjectID);
  if (!args.force) {
    const cached = resolveCache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }
  }

  let spec = args.spec;
  let fallbackBaseSha = "";
  let fallbackHeadSha = "";

  if (spec.mode === "mr") {
    if (!spec.mrIid) {
      throw new Error("MR compare 缺少 iid");
    }
    const mr = await fetchMergeRequestCompareRefs(args.provider, args.repoID, spec.mrIid);
    if (mr.state !== "opened") {
      throw new Error(
        `MR !${spec.mrIid} 已${mr.state === "merged" ? "合并" : "关闭"}，只能对比未合并的 MR`,
      );
    }
    spec = {
      ...spec,
      live: true,
      baseKind: "branch",
      headKind: "branch",
      baseRef: mr.targetBranch,
      headRef: mr.sourceBranch,
    };
    fallbackBaseSha = mr.targetSha;
    fallbackHeadSha = mr.sourceSha;
  }

  const [baseSha, headSha] = await Promise.all([
    resolveRefToSha(args.provider, args.repoID, spec.baseKind, spec.baseRef, fallbackBaseSha),
    resolveRefToSha(args.provider, args.repoID, spec.headKind, spec.headRef, fallbackHeadSha),
  ]);

  const value: ResolvedCompare = {
    spec,
    subjectID,
    baseSha,
    headSha,
    baseRef: spec.baseRef,
    headRef: spec.headRef,
  };
  resolveCache.set(key, { value, expiresAt: Date.now() + RESOLVE_TTL_MS });
  return value;
}

export function invalidateCompareResolveCache(
  provider: string,
  repoID: string,
  subjectID: string,
): void {
  resolveCache.delete(cacheKey(provider, repoID, subjectID));
}

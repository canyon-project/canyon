import { diffLines } from "diff";
import type { ScmAdapter } from "@/api/scm/adapter.ts";

const JS_EXTENSIONS = ["ts", "tsx", "jsx", "vue", "js"];
const MAX_DIFF_FILES = 1000;
const MAX_CONCURRENT_FILES = 100;

function calculateNewRows(a: string, b: string): { additions: number[]; deletions: number[] } {
  const changes = diffLines(a || "", b || "");
  const additions: number[] = [];
  const deletions: number[] = [];

  const genArr = (start: number, len: number) =>
    Array.from({ length: len }, (_, i) => start - i).reverse();
  const sumToIndex = (arr: number[], idx: number) =>
    arr.slice(0, idx + 1).reduce((s, v) => s + v, 0);

  const addCounts = changes.map((c) => (c.added || c.removed ? 0 : (c.count ?? 0)));
  const remCounts = changes.map((c) => (c.added || c.removed ? 0 : (c.count ?? 0)));

  changes.forEach((change, idx) => {
    const count = change.count ?? 0;
    if (change.added) {
      const start = sumToIndex(addCounts, idx) + 1;
      additions.push(...genArr(start + count - 1, count));
    } else if (change.removed) {
      const start = sumToIndex(remCounts, idx) + 1;
      deletions.push(...genArr(start + count - 1, count));
    }
  });

  return { additions, deletions };
}

export async function diffLine(
  adapter: ScmAdapter,
  repoID: string,
  baseCommitSha: string,
  compareCommitSha: string,
  includesFileExtensions = JS_EXTENSIONS,
): Promise<{ path: string; additions: number[]; deletions: number[] }[]> {
  const commitInfo = await adapter.getCommitInfo(repoID, compareCommitSha);
  if (commitInfo.parent_ids.length === 0 || (commitInfo.stats?.additions ?? 0) >= 5000000) {
    return [];
  }
  const realBase = baseCommitSha || commitInfo.parent_ids[0];
  const gitDiffs = await adapter.getCompareDiffs(repoID, realBase, compareCommitSha);
  const isMatch = (p?: string) => {
    if (!p) return false;
    const normalizedPath = p.replace(/\\/g, "/");
    const segments = normalizedPath.split("/").filter(Boolean);
    if (segments.length === 0) return false;

    const last = segments[segments.length - 1];
    if (!includesFileExtensions.some((ext) => last.endsWith("." + ext))) return false;

    for (const segment of segments) {
      const lower = segment.toLowerCase();
      if (segment.startsWith(".")) return false;
      if (lower.includes("__test__") || lower.includes("test")) return false;
    }

    return true;
  };
  const filtered = gitDiffs.filter((d) => isMatch(d.new_path ?? d.old_path));
  if (filtered.length > MAX_DIFF_FILES) {
    return [];
  }

  const result: { path: string; additions: number[]; deletions: number[] }[] = [];
  for (let i = 0; i < filtered.length; i += MAX_CONCURRENT_FILES) {
    const batch = filtered.slice(i, i + MAX_CONCURRENT_FILES);
    const batchResults = await Promise.all(
      batch.map(async (d) => {
        const path = d.new_path ?? d.old_path ?? "";
        const [oldContent, newContent] = await Promise.all(
          [realBase, compareCommitSha].map((ref) =>
            adapter.getFileContent(repoID, path, ref).catch(() => ""),
          ),
        );
        return { path, ...calculateNewRows(oldContent, newContent) };
      }),
    );
    result.push(...batchResults);
  }
  return result;
}

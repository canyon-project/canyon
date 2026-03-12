import { diffLines } from "diff";
import type { ScmAdapter } from "@/api/scm/adapter.ts";

const JS_EXTENSIONS = ["ts", "tsx", "jsx", "vue", "js"];

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

  const isMatch = (p?: string) =>
    !!p && includesFileExtensions.some((ext) => p.endsWith("." + ext));
  const filtered = gitDiffs.filter((d) => isMatch(d.new_path ?? d.old_path));

  const result: { path: string; additions: number[]; deletions: number[] }[] = [];
  for (const d of filtered) {
    const path = d.new_path ?? d.old_path ?? "";
    const [oldContent, newContent] = await Promise.all(
      [realBase, compareCommitSha].map((ref) =>
        adapter.getFileContent(repoID, path, ref).catch(() => ""),
      ),
    );
    result.push({ path, ...calculateNewRows(oldContent, newContent) });
  }
  return result;
}

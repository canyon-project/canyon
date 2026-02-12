import * as Diff from 'diff';
import { Change, diffLines } from 'diff';
import type { ScmAdapter } from '../scm/adapter';

export function computeJSDiffLines(
  oldContent: string,
  newContent: string,
): {
  additions: number[];
  deletions: number[];
} {
  const additions: number[] = [];
  const deletions: number[] = [];

  if (!oldContent && !newContent) return { additions, deletions };

  const changes = diffLines(oldContent || '', newContent || '');
  let oldLine = 1;
  let newLine = 1;

  const isIgnorable = (line: string): boolean => {
    const trimmed = line.trim();
    if (trimmed === '') return true; // 空行
    if (trimmed.startsWith('//')) return true; // 单行注释（含 /// 指令）

    // 单行块注释，如: /* comment */
    if (/^\/\*.*\*\/$/.test(trimmed)) return true;

    // JSDoc 内部行，如: * desc 或  * @param
    if (/^\*(\s|@|$)/.test(trimmed)) return true;

    // 纯开始或纯结束的块注释行（无其它代码）
    if (trimmed.startsWith('/*') && !trimmed.includes('*/')) return true;
    if (trimmed.endsWith('*/') && !trimmed.includes('/*')) return true;

    // JSX 注释占位：{/* comment */}
    if (/^\{\s*\/\*.*\*\/\s*\}$/.test(trimmed)) return true;
    if (trimmed.startsWith('{/*') && !trimmed.includes('*/}')) return true;
    if (trimmed.endsWith('*/}') && !trimmed.includes('{/*')) return true;

    return false;
  };

  for (const change of changes) {
    const rawLines = change.value.split('\n');
    const lineCount = rawLines.length - 1; // 与 diffLines 的换行计数保持一致

    if (change.added) {
      for (let i = 0; i < lineCount; i++) {
        const lineStr = rawLines[i] ?? '';
        if (!isIgnorable(lineStr)) additions.push(newLine);
        newLine += 1;
      }
    } else if (change.removed) {
      for (let i = 0; i < lineCount; i++) {
        const lineStr = rawLines[i] ?? '';
        if (!isIgnorable(lineStr)) deletions.push(oldLine);
        oldLine += 1;
      }
    } else {
      oldLine += lineCount;
      newLine += lineCount;
    }
  }

  return { additions, deletions };
}

type ChangedFile = {
  old_path?: string;
  new_path?: string;
  new_file?: boolean;
  deleted_file?: boolean;
};

export function filterChangedFilesForJsTs(
  files: ChangedFile[],
  filepath?: string | null,
): ChangedFile[] {
  const isJsTsFile = (filePath?: string): boolean => {
    if (!filePath) return false;
    const ext = filePath.toLowerCase().split('.').pop();
    return ['js', 'jsx', 'ts', 'tsx'].includes(ext || '');
  };
  const matchesFilepath = (filePath?: string): boolean => {
    if (!filepath || !filePath) return true;
    return filePath.includes(filepath);
  };
  return (files || []).filter((file) => {
    const isJsTs = isJsTsFile(file.new_path) || isJsTsFile(file.old_path);
    const matchesPath =
      matchesFilepath(file.new_path) || matchesFilepath(file.old_path);
    return isJsTs && matchesPath;
  });
}

export interface DiffLineParams {
  adapter: ScmAdapter;
  repoID: string;
  baseCommitSha?: string;
  compareCommitSha: string;
  includesFileExtensions?: string[];
}

function calculateNewRows(
  a: string,
  b: string,
): { additions: number[]; deletions: number[] } {
  const diffResult: Change[] = Diff.diffLines(a, b);
  function generateArray(startValue: number, length: number) {
    return Array.from({ length }, (_, index) => startValue - index).reverse();
  }
  function sumToIndex(arr: number[], index: number) {
    return arr.slice(0, index + 1).reduce((sum, value) => sum + value, 0);
  }
  const additionsDiffResult = diffResult.filter((i) => !i.removed);
  const additions: any = [];
  additionsDiffResult.forEach((i, index) => {
    if (i.added) {
      additions.push(
        generateArray(
          sumToIndex(
            additionsDiffResult.map((i) => i.count || 0),
            index,
          ),
          i.count || 0,
        ),
      );
    }
  });

  const deletionsDiffResult = diffResult.filter((i) => i.removed);
  const deletions: any = [];
  deletionsDiffResult.forEach((i, index) => {
    if (i.removed) {
      deletions.push(
        generateArray(
          sumToIndex(
            deletionsDiffResult.map((i) => i.count || 0),
            index,
          ),
          i.count || 0,
        ),
      );
    }
  });
  return {
    additions: additions.flat(Infinity),
    deletions: deletions.flat(Infinity),
  };
}

export async function diffLine({
  adapter,
  repoID,
  baseCommitSha,
  compareCommitSha,
  includesFileExtensions = ['ts', 'tsx', 'jsx', 'vue', 'js'],
}: DiffLineParams): Promise<
  { path: string; additions: number[]; deletions: number[] }[]
> {
  const commitInfo = await adapter.getCommitInfo(repoID, compareCommitSha);
  const result: { path: string; additions: number[]; deletions: number[] }[] = [];

  if (
    commitInfo.parent_ids.length === 0 ||
    commitInfo.stats.additions >= 5000000
  ) {
    return result;
  }

  const realBaseCommitSha =
    baseCommitSha ?? commitInfo.parent_ids[0];
  const gitDiffs = await adapter.getCompareDiffs(
    repoID,
    realBaseCommitSha,
    compareCommitSha,
  );

  const isMatchingExtension = (
    exts: string[],
    pathname: string | undefined,
  ) =>
    !!pathname && exts.some((ext) => pathname.endsWith('.' + ext));

  const gitDiffsFiltered = gitDiffs.filter((d) =>
    isMatchingExtension(includesFileExtensions, d.new_path ?? d.old_path),
  );

  for (const gitDiff of gitDiffsFiltered) {
    const path = gitDiff.new_path ?? gitDiff.old_path ?? '';
    const contents = await Promise.all(
      [realBaseCommitSha, compareCommitSha].map((ref) =>
        adapter.getFileContent(repoID, path, ref).catch(() => ''),
      ),
    );
    result.push({
      path,
      ...calculateNewRows(contents[0], contents[1]),
    });
  }
  return result;
}

import * as Diff from 'diff';
import { Change, diffLines } from 'diff';

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

interface DiffLine {
  repoID: string;
  baseCommitSha?: string;
  compareCommitSha: string;
  includesFileExtensions?: string[];
  gitlabUrl?: string;
  token?: string;
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

function getDecode(str: string) {
  return decodeURIComponent(
    atob(str)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join(''),
  );
}

export async function diffLine({
  repoID,
  baseCommitSha = undefined,
  compareCommitSha,
  includesFileExtensions = ['ts', 'tsx', 'jsx', 'vue', 'js'],
  gitlabUrl = 'https://gitlab.com',
  token = 'default_token',
}: DiffLine): Promise<
  { path: string; additions: number[]; deletions: number[] }[]
> {
  const gitlabApiUrlFile = `${gitlabUrl}/api/v4/projects/${repoID}/repository/files`;
  const gitlabApiUrlCommit = `${gitlabUrl}/api/v4/projects/${repoID}/repository/commits/${compareCommitSha}`;

  const gitlabApiUrlCommitResponse = await fetch(gitlabApiUrlCommit, {
    headers: {
      // Authorization: 'Bearer ' + token, // 在请求头中使用 GitLab API token
      'private-token': token,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      return {
        parent_ids: data.parent_ids || [],
        stats: data.stats,
      };
    });

  const result = [];
  // 只关心 50000 行以内的更改
  if (
    gitlabApiUrlCommitResponse.parent_ids.length > 0 &&
    gitlabApiUrlCommitResponse.stats.additions < 5000000
  ) {
    // 声明realBaseCommitSha，如果baseCommitSha存在，则使用baseCommitSha，否则使用gitlabApiUrlCommitResponse.parent_ids[0]
    const realBaseCommitSha =
      baseCommitSha || gitlabApiUrlCommitResponse.parent_ids[0];
    const gitDiffs = await fetch(
      `${gitlabUrl}/api/v4/projects/${repoID}/repository/compare?from=${realBaseCommitSha}&to=${compareCommitSha}`,
      {
        headers: {
          // Authorization: 'Bearer ' + token, // 在请求头中使用 GitLab API token
          'private-token': token,
        },
      },
    )
      .then((res) => res.json())
      .then((response) => {
        return (response.diffs || []).map(
          ({
            old_path,
            new_path,
            a_mode,
            b_mode,
            new_file,
            renamed_file,
            deleted_file,
          }) => {
            return {
              old_path,
              new_path,
              a_mode,
              b_mode,
              new_file,
              renamed_file,
              deleted_file,
            };
          },
        );
      });

    // const includesFileExtensions = /\.tsx?$|\.jsx?$|\.vue$|\.js$/i;

    const isMatchingExtension = (
      includesFileExtensions: string[],
      pathname: string,
    ) => includesFileExtensions.some((ext) => pathname.endsWith('.' + ext));

    const gitDiffsFiltered = gitDiffs.filter((gitDiff) =>
      isMatchingExtension(includesFileExtensions, gitDiff.new_path),
    );

    for (let i = 0; i < gitDiffsFiltered.length; i++) {
      const contents = await Promise.all(
        [realBaseCommitSha, compareCommitSha].map((c) => {
          return fetch(
            `${gitlabApiUrlFile}/${encodeURIComponent(
              gitDiffsFiltered[i].new_path,
            )}?ref=${c}`,
            {
              headers: {
                // Authorization: 'Bearer ' + token, // 在请求头中使用 GitLab API token
                'private-token': token,
              },
              method: 'GET',
            },
          )
            .then((res) => res.json())
            .then((r) => {
              return getDecode(r.content);
            })
            .catch(() => {
              return '';
            });
        }),
      );
      //@ts-expect-error
      result.push({
        path: gitDiffsFiltered[i].new_path,
        ...calculateNewRows(contents[0], contents[1]),
      });
    }
  }
  return result;
}

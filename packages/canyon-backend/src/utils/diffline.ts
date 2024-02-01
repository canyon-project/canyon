import * as Diff from 'diff';
import { Change } from 'diff';
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
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
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
      'private-token': process.env.PRIVATE_TOKEN,
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
    gitlabApiUrlCommitResponse.stats.additions < 50000
  ) {
    // 声明realBaseCommitSha，如果baseCommitSha存在，则使用baseCommitSha，否则使用gitlabApiUrlCommitResponse.parent_ids[0]
    const realBaseCommitSha =
      baseCommitSha || gitlabApiUrlCommitResponse.parent_ids[0];
    const gitDiffs = await fetch(
      `${gitlabUrl}/api/v4/projects/${repoID}/repository/compare?from=${realBaseCommitSha}&to=${compareCommitSha}`,
      {
        headers: {
          // Authorization: 'Bearer ' + token, // 在请求头中使用 GitLab API token
          'private-token': process.env.PRIVATE_TOKEN,
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
                'private-token': process.env.PRIVATE_TOKEN,
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
      result.push({
        path: gitDiffsFiltered[i].new_path,
        ...calculateNewRows(contents[0], contents[1]),
      });
    }
  }
  return result;
}

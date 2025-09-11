import axios from 'axios';
import type { CodeDiffChangedLinesOutput } from '@/helpers/backend/gen/graphql.ts';

export function getDecode(str: string) {
  return decodeURIComponent(
    atob(str)
      .split('')
      .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
      .join(''),
  );
}

export function handleSelectFileBySubject({
  repoID,
  subject,
  subjectID,
  filepath,
  provider = 'gitlab',
  buildProvider,
  buildID,
  reportProvider,
  reportID,
  // @ts-expect-error
  codeDiffChangedLinesRefetch,
}: {
  repoID: string;
  subject:
    | 'commit'
    | 'commits'
    | 'pull'
    | 'pulls'
    | 'multiple-commits'
    | 'multi-commits';
  subjectID: string; // sha | pullNumber | shas
  filepath: string;
  provider?: string;
  buildProvider?: string;
  buildID?: string;
  reportProvider?: string;
  reportID?: string;
}) {
  // 代码内容读取：commit 用 sha；pull 用 pullNumber；multiple-commits 用第一个 sha
  const codeParams: {
    repoID: string;
    filepath: string;
    sha?: string;
    pullNumber?: string;
  } = { repoID, filepath };
  if (subject === 'pull' || subject === 'pulls') {
    codeParams.pullNumber = subjectID;
  } else if (subject === 'multiple-commits' || subject === 'multi-commits') {
    codeParams.sha = (subjectID || '').split(',')[0] || '';
  } else {
    codeParams.sha = subjectID;
  }

  const fileContentRequest = axios
    .post('/graphql', {
      operationName: 'CodeFileContent',
      variables: {
        repoID: codeParams.repoID,
        filepath: codeParams.filepath,
        sha: codeParams.sha,
        pullNumber: codeParams.pullNumber,
      },
      query:
        'query CodeFileContent($repoID: String!, $filepath: String!, $sha: String, $pullNumber: String, $provider: String) {\n  codeFileContent(\n    repoID: $repoID\n    filepath: $filepath\n    sha: $sha\n    pullNumber: $pullNumber\n    provider: $provider\n  ) {\n    content\n    __typename\n  }\n}',
    })
    .then(({ data }) => data.data.codeFileContent);

  const codeDiffChangedLinesRefetchFn = codeDiffChangedLinesRefetch({
    input: {
      repoID: codeParams.repoID,
      filepath: codeParams.filepath,
      subjectID: codeParams.sha,
      subject: 'commit',
    },
  }).then(
    (r: {
      data: {
        codeDiffChangedLines: CodeDiffChangedLinesOutput;
      };
    }) =>
      r.data.codeDiffChangedLines.files.length > 0
        ? r.data.codeDiffChangedLines.files[0].additions
        : [],
  );

  const fileCoverageParams: {
    provider?: string;
    repoID: string;
    subject:
      | 'commit'
      | 'commits'
      | 'pull'
      | 'pulls'
      | 'multiple-commits'
      | 'multi-commits';
    subjectID: string;
    filePath: string;
    buildProvider?: string;
    buildID?: string;
    reportProvider?: string;
    reportID?: string;
  } = {
    provider,
    repoID,
    subject,
    subjectID,
    filePath: filepath,
  };
  if (buildProvider) fileCoverageParams.buildProvider = buildProvider;
  if (buildID) fileCoverageParams.buildID = buildID;
  if (reportProvider) fileCoverageParams.reportProvider = reportProvider;
  if (reportID) fileCoverageParams.reportID = reportID;

  const fileCoverageRequest = axios
    .get('/api/coverage/map', {
      params: {
        ...fileCoverageParams,
        mode: 'blockMerge',
      },
    })
    .then(({ data }) => data[filepath || '']);

  return Promise.all([
    fileContentRequest,
    fileCoverageRequest,
    codeDiffChangedLinesRefetchFn,
  ]).then(([fileContent, fileCoverage, c]) => {
    return {
      fileContent: getDecode(fileContent.content),
      fileCoverage,
      fileCodeChange: c,
    };
  });
}

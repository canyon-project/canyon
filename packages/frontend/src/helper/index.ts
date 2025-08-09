import axios from 'axios';

export function getDecode(str: string) {
  return decodeURIComponent(
    atob(str)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(''),
  );
}

interface HandleSelectFile {
  repoID: string;
  sha: string;
  filepath?: string | null;
  reportID?: string | null;
  buildID?: string;
  buildProvider?: string;
}
export function handleSelectFile({
  repoID,
  sha,
  filepath,
  reportID,
  buildID,
  buildProvider,
}: HandleSelectFile) {
  const fileContentRequest = axios
    .get(`/api/code`, {
      params: {
        repoID: repoID,
        sha: sha,
        filepath: filepath,
      },
    })
    .then(({ data }) => data);
  const fileCoverageRequest = axios
    .get(`/api/coverage/map`, {
      params: {
        repoID,
        reportID: reportID,
        sha: sha,
        filePath: filepath,
        provider: 'gitlab',
        buildProvider,
        buildID,
      },
    })
    .then(({ data }) => data[filepath || '']);

  // const fileCodeChangeRequest = axios
  //   .get(`/api/codechange`, {
  //     // operationName: 'GetCodeChange',
  //     params: {
  //       sha: sha,
  //       filepath: filepath,
  //     },
  //   })
  //   .then(({ data }) => data);
  return Promise.all([
    fileContentRequest,
    fileCoverageRequest,
    // fileCodeChangeRequest,
  ]).then(([fileContent, fileCoverage]) => {
    return {
      fileContent: getDecode(fileContent.content),
      fileCoverage: fileCoverage,
      fileCodeChange: [],
      // fileCodeChange: fileCodeChange.additions || [],
    };
  });
}

export function handleSelectFilePull({
  repoID,
  filepath,
  pullNumber,
  provider = 'gitlab',
  headSha,
}: {
  repoID: string;
  filepath: string;
  pullNumber: string | number;
  provider?: string;
  headSha?: string; // 可选，若提供则优先使用sha，否则使用pullNumber
}) {
  const codeParams: Record<string, any> = {
    repoID,
    filepath,
  };
  if (headSha) {
    codeParams.sha = headSha;
  } else {
    codeParams.pullNumber = pullNumber;
  }

  const fileContentRequest = axios
    .get(`/api/code`, { params: codeParams })
    .then(({ data }) => data);

  const fileCoverageRequest = axios
    .get(`/api/coverage/map/pull`, {
      params: {
        provider,
        repoID,
        pullNumber,
        filePath: filepath,
      },
    })
    .then(({ data }) => data[filepath || '']);

  return Promise.all([fileContentRequest, fileCoverageRequest]).then(
    ([fileContent, fileCoverage]) => {
      return {
        fileContent: getDecode(fileContent.content),
        fileCoverage,
        fileCodeChange: [],
      };
    },
  );
}

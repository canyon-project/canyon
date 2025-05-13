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
    .get(`/api/sourcecode`, {
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
    .then(({ data }) => data.data[filepath || '']);

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
  ]).then(([fileContent, fileCoverage, fileCodeChange]) => {
    return {
      fileContent: getDecode(fileContent.content),
      fileCoverage: fileCoverage,
      fileCodeChange: [],
      // fileCodeChange: fileCodeChange.additions || [],
    };
  });
}

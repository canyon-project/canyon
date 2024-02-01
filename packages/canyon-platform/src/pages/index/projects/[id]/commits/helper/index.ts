// import { data } from 'autoprefixer';
import axios from 'axios';
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

interface HandleSelectFile {
  projectID: string;
  sha: string;
  filepath: string;
  reportID: string;
  mode: string;
}
export function handleSelectFile({ projectID, sha, filepath, reportID }: HandleSelectFile) {
  // coverage/map
  // codechange
  // sourcecode

  const fileContentRequest = axios
    .get(`/api/sourcecode`, {
      params: {
        projectID: projectID,
        sha: sha,
        filepath: filepath,
      },
    })
    .then(({ data }) => data);
  const fileCoverageRequest = axios
    .get(`/api/coverage/map`, {
      params: {
        reportID: reportID,
        sha: sha,
        filepath: filepath,
      },
    })
    .then(({ data }) => data);

  const fileCodeChangeRequest = axios
    .get(`/api/codechange`, {
      // operationName: 'GetCodeChange',
      params: {
        sha: sha,
        filepath: filepath,
      },
    })
    .then(({ data }) => data);
  // commitSha, reportID, filepath
  return Promise.all([fileContentRequest, fileCoverageRequest, fileCodeChangeRequest]).then(
    ([fileContent, fileCoverage, fileCodeChange]) => {
      return {
        fileContent: getDecode(fileContent.content),
        fileCoverage: fileCoverage,
        fileCodeChange: fileCodeChange.additions || [],
      };
    },
  );
}

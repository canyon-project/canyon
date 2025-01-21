import axios from "axios";

function getDecode(str: string) {
  return decodeURIComponent(
    atob(str)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(""),
  );
}

interface HandleSelectFile {
  projectID: string;
  sha: string;
  filepath?: string | null;
  reportID?: string | null;
}
export function handleSelectFile({
                                   projectID,
                                   sha,
                                   filepath,
                                   reportID,
                                 }: HandleSelectFile) {
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
        projectID,
        reportID: reportID,
        sha: sha,
        filepath: filepath,
      },
    })
    .then(({ data }) => data[filepath || ""]);

  const fileCodeChangeRequest = axios
    .get(`/api/codechange`, {
      // operationName: 'GetCodeChange',
      params: {
        sha: sha,
        filepath: filepath,
      },
    })
    .then(({ data }) => data);
  return Promise.all([
    fileContentRequest,
    fileCoverageRequest,
    fileCodeChangeRequest,
  ]).then(([fileContent, fileCoverage, fileCodeChange]) => {
    return {
      fileContent: getDecode(fileContent.content),
      fileCoverage: fileCoverage,
      fileCodeChange: fileCodeChange.additions || [],
    };
  });
}

// @ts-ignore
export const getCoverageSummaryMapService = ({ projectID, sha, reportID }) =>
  axios({
    url: "/api/coverage/summary/v2/map",
    method: "GET",
    params: {
      reportID: reportID,
      sha: sha,
      projectID: projectID,
    },
  }).then(({ data }) => data);
// .then((r) => {
//   return Object.values(r).reduce((acc: any[], cur: any) => {
//     acc.push(cur);
//     return acc;
//   }, []);
// });

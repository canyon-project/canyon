// import { data } from 'autoprefixer';
import axios from 'axios';

import { getDecode } from '../../../../../../helpers/utils/common.ts';

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
        projectID,
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

export const getCoverageSummaryMapService = ({ projectID, sha, reportID }) =>
  axios({
    url: '/api/coverage/summary/map',
    method: 'GET',
    params: {
      reportID: reportID || '',
      sha: sha || '',
      projectID: projectID || '',
    },
  })
    .then(({ data }) => data)
    .then((r) =>
      r.map((i) => ({
        ...i,
        path: i.path.replace('~/', ''),
      })),
    )
    .then((r) => {
      return r;
    });

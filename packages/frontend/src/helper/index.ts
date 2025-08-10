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

export function handleSelectFileMultipleCommits({
  repoID,
  shas,
  filepath,
  provider = 'gitlab',
}: {
  repoID: string;
  shas: string; // 逗号分隔
  filepath: string;
  provider?: string;
}) {
  // 使用第一个 SHA 作为读取文件内容的基线
  const firstSha = (shas || '').split(',')[0] || '';

  const fileContentRequest = axios
    .get(`/api/code`, {
      params: { repoID, sha: firstSha, filepath },
    })
    .then(({ data }) => data);

  const fileCoverageRequest = axios
    .get(`/api/coverage/map/subject`, {
      params: {
        provider,
        repoID,
        subject: 'multiple-commits',
        subjectID: shas,
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
}: {
  repoID: string;
  subject: 'commit' | 'commits' | 'pull' | 'pulls' | 'multiple-commits' | 'multi-commits';
  subjectID: string; // sha | pullNumber | shas
  filepath: string;
  provider?: string;
  buildProvider?: string;
  buildID?: string;
  reportProvider?: string;
  reportID?: string;
}) {
  // 代码内容读取：commit 用 sha；pull 用 pullNumber；multiple-commits 用第一个 sha
  const codeParams: Record<string, any> = { repoID, filepath };
  if (subject === 'pull' || subject === 'pulls') {
    codeParams.pullNumber = subjectID;
  } else if (subject === 'multiple-commits' || subject === 'multi-commits') {
    codeParams.sha = (subjectID || '').split(',')[0] || '';
  } else {
    codeParams.sha = subjectID;
  }

  const fileContentRequest = axios.get(`/api/code`, { params: codeParams }).then(({ data }) => data);

  const fileCoverageParams: Record<string, any> = {
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
    .get(`/api/coverage/map/subject`, { params: fileCoverageParams })
    .then(({ data }) => data[filepath || '']);

  return Promise.all([fileContentRequest, fileCoverageRequest]).then(([fileContent, fileCoverage]) => {
    return {
      fileContent: getDecode(fileContent.content),
      fileCoverage,
      fileCodeChange: [],
    };
  });
}

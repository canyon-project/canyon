import axios from 'axios';

export function getDecode(str: string) {
  return decodeURIComponent(
    atob(str)
      .split('')
      .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
      .join('')
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
// 兼容旧函数名，内部转发到 subject 版本
export function handleSelectFile(params: any) {
  const { repoID, sha, filepath, reportID, buildID, buildProvider } = params || {};
  return handleSelectFileBySubject({
    repoID,
    subject: 'commit',
    subjectID: sha,
    filepath,
    provider: 'gitlab',
    buildProvider,
    buildID,
    reportProvider: params?.reportProvider,
    reportID,
  });
}

// 废弃：请使用 handleSelectFileBySubject(subject='pull')
export function handleSelectFilePull(params: any) {
  const { repoID, filepath, pullNumber, provider } = params || {};
  return handleSelectFileBySubject({
    repoID,
    subject: 'pull',
    subjectID: String(pullNumber),
    filepath,
    provider: provider || 'gitlab',
  });
}

// 废弃：请使用 handleSelectFileBySubject(subject='multiple-commits')
export function handleSelectFileMultipleCommits(params: any) {
  const { repoID, shas, filepath, provider } = params || {};
  return handleSelectFileBySubject({
    repoID,
    subject: 'multiple-commits',
    subjectID: shas,
    filepath,
    provider: provider || 'gitlab',
  });
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

  const fileContentRequest = axios
    .get('/api/code', { params: codeParams })
    .then(({ data }) => data);

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
    .get('/api/coverage/map', {
      params: {
        ...fileCoverageParams,
        blockMerge: true,
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
    }
  );
}

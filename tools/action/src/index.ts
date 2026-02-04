import * as core from '@actions/core';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 从 GitHub Actions 环境变量获取仓库信息
 */
function getGitHubInfo() {
  const repository = process.env.GITHUB_REPOSITORY || '';
  const [owner, repo] = repository.split('/');
  const sha = process.env.GITHUB_SHA || '';
  const ref = process.env.GITHUB_REF || '';
  const eventName = process.env.GITHUB_EVENT_NAME || '';
  const eventPath = process.env.GITHUB_EVENT_PATH || '';

  // 尝试从 event 中获取 PR 信息
  let prNumber: string | null = null;
  if (eventPath && fs.existsSync(eventPath)) {
    try {
      const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf-8'));
      if (eventData.pull_request?.number) {
        prNumber = String(eventData.pull_request.number);
      }
    } catch (error) {
      // 忽略解析错误
    }
  }

  // 从 ref 中提取 PR 号（格式：refs/pull/123/merge）
  if (!prNumber && ref.startsWith('refs/pull/')) {
    const match = ref.match(/refs\/pull\/(\d+)\//);
    if (match) {
      prNumber = match[1];
    }
  }

  return {
    provider: 'github',
    owner,
    repo,
    sha,
    ref,
    eventName,
    prNumber,
  };
}

/**
 * 确定 subject 和 subjectID
 */
function getSubjectInfo(githubInfo: ReturnType<typeof getGitHubInfo>): {
  subject: string;
  subjectID: string;
} {
  // 如果是 PR，使用 pr 作为 subject
  if (githubInfo.prNumber) {
    return {
      subject: 'pr',
      subjectID: githubInfo.prNumber,
    };
  }

  // 否则使用 commit 作为 subject
  return {
    subject: 'commit',
    subjectID: githubInfo.sha,
  };
}

/**
 * 上传文件到服务器
 */
async function uploadCoverageFiles(
  url: string,
  reportDataPath: string,
  diffDataPath: string,
  provider: string,
  org: string,
  repo: string,
  subject: string,
  subjectID: string,
  token?: string,
): Promise<any> {
  // 检查文件是否存在
  if (!fs.existsSync(reportDataPath)) {
    throw new Error(`report-data.js not found: ${reportDataPath}`);
  }
  if (!fs.existsSync(diffDataPath)) {
    throw new Error(`diff-data.js not found: ${diffDataPath}`);
  }

  // 读取文件内容
  const reportDataContent = fs.readFileSync(reportDataPath, 'utf-8');
  const diffDataContent = fs.readFileSync(diffDataPath, 'utf-8');

  // 创建 FormData（Node.js 20+ 支持全局 FormData）
  const formData = new FormData();

  // 添加文件（使用 File 或 Blob）
  // 在 Node.js 中，可以使用 Blob 或直接使用字符串
  const reportDataBlob = new Blob([reportDataContent], {
    type: 'application/javascript',
  });
  const diffDataBlob = new Blob([diffDataContent], {
    type: 'application/javascript',
  });

  formData.append('report-data.js', reportDataBlob, 'report-data.js');
  formData.append('diff-data.js', diffDataBlob, 'diff-data.js');

  // 添加参数
  formData.append('provider', provider);
  formData.append('org', org);
  formData.append('repo', repo);
  formData.append('subject', subject);
  formData.append('subjectID', subjectID);

  // 设置请求头（FormData 会自动设置 Content-Type，但我们需要添加 Authorization）
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // 发送请求
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `HTTP ${response.status}: ${response.statusText}\n${errorText}`,
    );
  }

  return response.json();
}

/**
 * 主函数
 */
async function run() {
  // 获取输入参数（在 try 外获取 failOnError，以便在 catch 中使用）
  const failOnErrorInput = core.getInput('fail-on-error');
  const failOnError =
    failOnErrorInput === '' ? true : core.getBooleanInput('fail-on-error');

  try {
    // 获取输入参数
    const coverageDir = core.getInput('coverage-dir') || 'coverage';
    const canyonUrl = core.getInput('canyon-url', { required: true });
    const canyonToken = core.getInput('canyon-token');

    // 构建文件路径
    const reportDataPath = path.resolve(coverageDir, 'data', 'report-data.js');
    const diffDataPath = path.resolve(coverageDir, 'data', 'diff-data.js');

    core.info(`Looking for coverage files in: ${coverageDir}/data/`);
    core.info(`Report data path: ${reportDataPath}`);
    core.info(`Diff data path: ${diffDataPath}`);

    // 获取 GitHub 信息
    const githubInfo = getGitHubInfo();
    const { subject, subjectID } = getSubjectInfo(githubInfo);

    core.info(`Provider: ${githubInfo.provider}`);
    core.info(`Org: ${githubInfo.owner}`);
    core.info(`Repo: ${githubInfo.repo}`);
    core.info(`Subject: ${subject}`);
    core.info(`SubjectID: ${subjectID}`);

    // 上传文件
    core.info('Uploading coverage files...');
    const uploadUrl = `${canyonUrl.replace(/\/$/, '')}/api/cov/upload`;
    const result = await uploadCoverageFiles(
      uploadUrl,
      reportDataPath,
      diffDataPath,
      githubInfo.provider,
      githubInfo.owner,
      githubInfo.repo,
      subject,
      subjectID,
      canyonToken,
    );

    if (!result.success) {
      throw new Error(`Upload failed: ${result.message || 'Unknown error'}`);
    }

    core.info(
      `Coverage upload successful. CoverageID: ${result.data?.coverageId}, Diff files count: ${result.data?.diffFilesCount}`,
    );

    // 设置输出
    if (result.data?.coverageId) {
      core.setOutput('coverage-id', result.data.coverageId);
    }
    if (result.data?.diffFilesCount !== undefined) {
      core.setOutput('diff-files-count', result.data.diffFilesCount);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    core.error(errorMessage);

    if (failOnError) {
      core.setFailed(errorMessage);
    }
  }
}

// 执行主函数
run();

import * as core from '@actions/core';
import * as fs from 'fs';
import * as path from 'path';

interface CoverageData {
  [filePath: string]: {
    buildHash?: string;
    provider?: string;
    repoID?: string;
    sha?: string;
    buildTarget?: string;
    instrumentCwd?: string;
    [key: string]: any;
  };
}

interface Scene {
  [key: string]: any;
}

interface BuildInfo {
  [key: string]: any;
}

/**
 * 从 GitHub Actions 环境变量获取仓库信息
 */
function getGitHubInfo() {
  const repository = process.env.GITHUB_REPOSITORY || '';
  const [owner, repo] = repository.split('/');
  const sha = process.env.GITHUB_SHA || '';
  const ref = process.env.GITHUB_REF || '';
  const workflow = process.env.GITHUB_WORKFLOW || '';
  const runId = process.env.GITHUB_RUN_ID || '';
  const runAttempt = process.env.GITHUB_RUN_ATTEMPT || '';

  return {
    provider: 'github',
    repoID: repository,
    owner,
    repo,
    sha,
    ref,
    workflow,
    runId,
    runAttempt,
  };
}

/**
 * 读取并合并多个 coverage 文件
 */
function loadCoverageFiles(filePaths: string[]): CoverageData {
  const mergedCoverage: CoverageData = {};

  for (const filePath of filePaths) {
    const fullPath = path.resolve(filePath.trim());

    if (!fs.existsSync(fullPath)) {
      core.warning(`Coverage file not found: ${fullPath}`);
      continue;
    }

    try {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const coverage = JSON.parse(content) as CoverageData;

      // 合并 coverage 数据
      Object.assign(mergedCoverage, coverage);
      core.info(`Loaded coverage from: ${fullPath}`);
    } catch (error) {
      core.error(`Failed to parse coverage file ${fullPath}: ${error}`);
      throw error;
    }
  }

  return mergedCoverage;
}

/**
 * 准备 map/init 请求的数据
 */
function prepareMapInitData(
  coverage: CoverageData,
  githubInfo: ReturnType<typeof getGitHubInfo>,
  instrumentCwd: string,
  buildTarget: string,
): any {
  // 从 coverage 的第一个值中提取信息（如果存在）
  const firstCoverageValue = Object.values(coverage)[0];

  const buildInfo: BuildInfo = {
    workflow: githubInfo.workflow,
    runId: githubInfo.runId,
    runAttempt: githubInfo.runAttempt,
    ref: githubInfo.ref,
  };

  return {
    sha: firstCoverageValue?.sha || githubInfo.sha,
    provider: firstCoverageValue?.provider || githubInfo.provider,
    repoID: firstCoverageValue?.repoID || githubInfo.repoID,
    instrumentCwd: firstCoverageValue?.instrumentCwd || instrumentCwd,
    buildTarget: firstCoverageValue?.buildTarget || buildTarget || '',
    build: buildInfo,
    coverage,
  };
}

/**
 * 准备 client 请求的数据
 */
function prepareClientData(coverage: CoverageData, scene: Scene): any {
  // 清理 coverage 数据，移除不需要的字段
  const cleanedCoverage: CoverageData = {};
  const fieldsToRemove = [
    'statementMap',
    'fnMap',
    'branchMap',
    'inputSourceMap',
  ];

  for (const [filePath, coverageData] of Object.entries(coverage)) {
    if (coverageData && typeof coverageData === 'object') {
      cleanedCoverage[filePath] = { ...coverageData };
      // 删除指定字段
      for (const field of fieldsToRemove) {
        delete cleanedCoverage[filePath][field];
      }
    }
  }

  return {
    coverage: cleanedCoverage,
    scene,
  };
}

/**
 * 发送 HTTP 请求
 */
async function sendRequest(
  url: string,
  data: any,
  token?: string,
): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
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
    const coverageFileInput = core.getInput('coverage-file', {
      required: true,
    });
    const canyonUrl = core.getInput('canyon-url', { required: true });
    const canyonToken = core.getInput('canyon-token');
    const instrumentCwd = core.getInput('instrument-cwd', { required: true });
    const buildTarget = core.getInput('build-target') || '';
    const sceneInput = core.getInput('scene') || '{}';

    // 解析 coverage 文件路径（支持多个文件，逗号分隔）
    const coverageFilePaths = coverageFileInput
      .split(',')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    if (coverageFilePaths.length === 0) {
      throw new Error('No coverage files specified');
    }

    // 解析 scene 信息
    let scene: Scene = {};
    try {
      scene = JSON.parse(sceneInput);
    } catch (error) {
      core.warning(`Failed to parse scene JSON: ${error}. Using empty object.`);
      scene = {};
    }

    // 添加 GitHub Actions 环境信息到 scene
    const githubInfo = getGitHubInfo();
    scene = {
      ...scene,
      source: 'automation',
      type: 'ci',
      env: 'test',
      trigger: 'pipeline',
      ...githubInfo,
    };

    core.info(`Loading coverage files: ${coverageFilePaths.join(', ')}`);
    const coverage = loadCoverageFiles(coverageFilePaths);

    if (Object.keys(coverage).length === 0) {
      throw new Error('No coverage data found in files');
    }

    core.info(`Loaded ${Object.keys(coverage).length} coverage entries`);

    // 准备 map/init 数据
    const mapInitData = prepareMapInitData(
      coverage,
      githubInfo,
      instrumentCwd,
      buildTarget,
    );

    // 调用 map/init 接口
    core.info('Uploading coverage map initialization...');
    const mapInitUrl = `${canyonUrl.replace(/\/$/, '')}/api/coverage/map/init`;
    const mapInitResult = await sendRequest(
      mapInitUrl,
      mapInitData,
      canyonToken,
    );

    if (!mapInitResult.success) {
      throw new Error(
        `Map init failed: ${mapInitResult.message || 'Unknown error'}`,
      );
    }

    core.info(`Map init successful. BuildHash: ${mapInitResult.buildHash}`);

    // 准备 client 数据
    const clientData = prepareClientData(coverage, scene);

    // 调用 client 接口
    core.info('Uploading coverage data...');
    const clientUrl = `${canyonUrl.replace(/\/$/, '')}/api/coverage/client`;
    const clientResult = await sendRequest(clientUrl, clientData, canyonToken);

    if (!clientResult.success) {
      throw new Error(
        `Client upload failed: ${clientResult.message || 'Unknown error'}`,
      );
    }

    core.info(
      `Coverage upload successful. BuildHash: ${clientResult.buildHash}, SceneKey: ${clientResult.sceneKey}`,
    );

    // 设置输出
    core.setOutput('build-hash', clientResult.buildHash);
    core.setOutput('scene-key', clientResult.sceneKey);
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

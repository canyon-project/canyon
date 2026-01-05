import * as console from 'node:console';
import fs from 'node:fs';
import path from 'node:path';
import axios from 'axios';
import { mergeCoverageMaps } from '../utils/mergeCoverage';

export async function mapCommand(params: any, options: any) {
  console.log('Current working directory:', process.cwd());

  const {
    dsn,
    repo_id: repoID,
    sha,
    provider,
    build_target,
    debug,
    instrument_cwd,
    filter,
  } = params;
  if (!fs.existsSync(path.resolve(process.cwd(), '.canyon_output'))) {
    console.log('不存在');
    return;
  }
  const files = fs.readdirSync(path.resolve(process.cwd(), '.canyon_output'));
  let data: Record<string, any> = {};
  for (let i = 0; i < files.length; i++) {
    const fileName = files[i];
    // filter 只对形如 coverage-final-xxx.json 的文件生效
    const isCoverageFinalFile = /^coverage-final-.*\.json$/.test(fileName);

    const fileCoverageString = fs.readFileSync(
      path.resolve(process.cwd(), '.canyon_output', fileName),
      'utf-8',
    );
    const fileCoverage = JSON.parse(fileCoverageString);

    // 如果传入了 filter，且文件名匹配 coverage-final-xxx.json 模式，则仅合并键（文件路径）包含该子串的覆盖数据
    let toMerge = fileCoverage;
    if (filter && typeof filter === 'string' && isCoverageFinalFile) {
      const filteredEntries = Object.entries(fileCoverage).filter(
        ([filePath]) => filePath.includes(filter),
      );
      if (filteredEntries.length === 0) {
        continue;
      }
      toMerge = Object.fromEntries(filteredEntries);
    }

    data = mergeCoverageMaps(data, toMerge);
  }

  const env_branch = process.env.CI_COMMIT_BRANCH;
  const env_buildID = process.env.CI_JOB_ID;
  const env_buildProvider = 'gitlab_runner';

  const p = {
    dsn,
    provider: provider || 'gitlab',
    repoID: repoID || process.env.CI_PROJECT_ID,
    sha: sha || process.env.CI_COMMIT_SHA,
    instrumentCwd: instrument_cwd || process.cwd(),
    reportID: 'initial_coverage_data',
    reportProvider: 'ci',
    buildTarget: build_target || '',
    coverage: Object.keys(data),
    build: {
      buildProvider: env_buildProvider,
      buildID: env_buildID,
      branch: env_branch,
    },
  };
  if (debug === 'true') {
    console.log(p);
  }
  await axios
    .post(dsn, {
      ...p,
      // 覆盖p中的coverage
      coverage: data,
    })
    .then((r) => {
      console.log(JSON.stringify(r.data, null, 2));
      return r;
    })
    .catch((err) => {
      if (err?.response?.data) {
        console.log(err?.response?.data);
      } else {
        String(err);
      }
      return err;
    });
}

import * as console from 'node:console';
import fs from 'node:fs';
import path from 'node:path';
import axios from 'axios';
import { mergeCoverageMaps } from '../utils/mergeCoverage';

export async function mapCommand(params: any, options: any) {
  const {
    dsn,
    repo_id: repoID,
    sha,
    provider,
    build_target,
    debug,
    instrument_cwd,
  } = params;
  if (!fs.existsSync(path.resolve(process.cwd(), '.canyon_output'))) {
    console.log('不存在');
    return;
  }
  const files = fs.readdirSync(path.resolve(process.cwd(), '.canyon_output'));
  let data: Record<string, any> = {};
  for (let i = 0; i < files.length; i++) {
    const fileCoverageString = fs.readFileSync(
      path.resolve(process.cwd(), '.canyon_output', files[i]),
      'utf-8',
    );
    const fileCoverage = JSON.parse(fileCoverageString);

    data = mergeCoverageMaps(data, fileCoverage);
  }

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
      return r;
    })
    .catch((err) => {
      if (err.response) {
        console.log(err.response);
      }
      return err;
    });
}

import * as path from 'path';
import { createCoverageMap } from 'istanbul-lib-coverage';

import * as libReport from 'istanbul-lib-report';

import * as reports from 'istanbul-reports';

import * as AdmZip from 'adm-zip';
export async function download(instrumentCmd, coverageMapData) {
  const obj = {};
  for (const objKey in coverageMapData) {
    obj[objKey.replace('~', instrumentCmd)] = {
      ...coverageMapData[objKey],
      path: objKey.replace('~', instrumentCmd),
    };
  }
  const coverageMap = createCoverageMap(obj);

  const context = libReport.createContext({
    dir: path.join(__dirname, '../../public/coverage'),
    defaultSummarizer: 'nested',
    coverageMap,
  });
  const report = reports.create('html', {});
  report.execute(context);
  const zip = new AdmZip();
  zip.addLocalFolder(path.join(__dirname, '../../public/coverage'));
  zip.writeZip(path.join(__dirname, '../../public/coverage.zip'));
}

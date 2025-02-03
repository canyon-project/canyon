import fs from 'fs';
import path from 'path'
import {extractCoverageData} from "./extract-coverage-data";

export const generateInitialCoverage = (paramsPath) => {
  const initialCoverageDataForTheCurrentFile = extractCoverageData(paramsPath)
  const filePath = './.canyon_output/coverage-final.json';
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {recursive: true});
  }
  // 防止返回的数据为空
  if (initialCoverageDataForTheCurrentFile && initialCoverageDataForTheCurrentFile.path) {
    fs.writeFileSync(`./.canyon_output/coverage-final-${Math.random()}.json`, JSON.stringify({
      [initialCoverageDataForTheCurrentFile.path]: initialCoverageDataForTheCurrentFile
    }, null, 2), 'utf-8');
  }
  return initialCoverageDataForTheCurrentFile;
}

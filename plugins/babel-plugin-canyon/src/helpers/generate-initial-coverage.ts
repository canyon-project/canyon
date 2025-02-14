import fs from 'fs';
import path from 'path'
import {extractCoverageData} from "./extract-coverage-data";

export const generateInitialCoverage = (paramsPath,serviceParams) => {
  const initialCoverageDataForTheCurrentFile = extractCoverageData(paramsPath)
  // 判断是否是CI环境
  // CI环境才生成.canyon_output/coverage-final.json文件
  if (serviceParams.ci) {
    const filePath = './.canyon_output/coverage-final.json';
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {recursive: true});
    }
    // 防止返回的数据为空
    if (initialCoverageDataForTheCurrentFile && initialCoverageDataForTheCurrentFile.path) {
      fs.writeFileSync(`./.canyon_output/coverage-final-${String(Math.random()).replace('0.','')}.json`, JSON.stringify({
        [initialCoverageDataForTheCurrentFile.path]: initialCoverageDataForTheCurrentFile
      }, null, 2), 'utf-8');
    }
  }
  return initialCoverageDataForTheCurrentFile;
}

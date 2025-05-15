// @ts-nocheck
import { decodeKey } from '../../../utils/ekey';
import {
  genSummaryMapByCoverageMap,
  getSummaryByPath,
  resetCoverageDataMap,
} from 'canyon-data';
import { convertClickHouseCoverageToIstanbul, fuzhi } from './coverage';

export const mergeHit = (coverageHitQuerySqlResultJson, initCovObj) => {
  initCovObj = resetCoverageDataMap(initCovObj);
  const r = [];
  Object.values(initCovObj).forEach((item123) => {
    const find = convertClickHouseCoverageToIstanbul(
      coverageHitQuerySqlResultJson.filter((i) => {
        // 这边要改，要取reletaion表反查
        return i.fullFilePath.includes(item123.path);
      }),
      item123.path,
    );

    // 这里要改，还原0
    const initCov = item123;

    if (find) {
      r.push(fuzhi(find, initCov));
    } else {
      r.push({
        path: initCov.path,
        b: initCov.b,
        f: initCov.f,
        s: initCov.s,
      });
    }
  });
  const summary = genSummaryMapByCoverageMap(
    r.reduce((previousValue, currentValue, currentIndex, array) => {
      previousValue[currentValue.path] = currentValue;
      return previousValue;
    }, {}),
    [],
  );
  const sum: any = getSummaryByPath('', summary);
  return sum;
};

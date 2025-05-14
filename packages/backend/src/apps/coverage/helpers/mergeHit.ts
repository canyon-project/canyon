// @ts-nocheck
import { decodeKey } from '../../../utils/ekey';
import {
  genSummaryMapByCoverageMap,
  getSummaryByPath,
  resetCoverageDataMap,
} from 'canyon-data';

export const mergeHit = (coverageHitQuerySqlResultJson, initCovObj) => {
  initCovObj = resetCoverageDataMap(initCovObj);
  const r = [];
  Object.values(initCovObj).forEach((item123) => {
    const find = coverageHitQuerySqlResultJson
      .filter((i) => {
        // 这边要改，要取reletaion表反查
        return i.fullFilePath.includes(item123.path);
      })
      .reduce(
        (previousValue, currentValue, currentIndex, array) => {
          const { s: s1, f: f1, b: b1 } = currentValue;
          const { s: s2, f: f2, b: b2 } = previousValue;
          const s = [[], []];

          s[0] = [...new Set([...s1[0], ...s2[0]])].sort();

          s[0].forEach((key) => {
            s[1][key] = Number(s1[1][key] || 0) + Number(s2[1][key] || 0);
          });

          const f = [[], []];

          f[0] = [...new Set([...f1[0], ...f2[0]])].sort();

          f[0].forEach((key) => {
            f[1][key] = Number(f1[1][key] || 0) + Number(f2[1][key] || 0);
          });

          const b = [[], []];

          b[0] = [...new Set([...b1[0], ...b2[0]])].sort();

          b[0].forEach((key) => {
            b[1][key] = Number(b1[1][key] || 0) + Number(b2[1][key] || 0);
          });

          return {
            ...previousValue,
            s: s,
            f: f,
            b: b,
          };
        },
        {
          fullFilePath: item123.path,
          b: [[], []],
          f: [[], []],
          s: [[], []],
        },
      );

    // 这里要改，还原0
    const initCov = item123;

    if (find) {
      const { s: merged_s, f: merged_f, b: merged_b } = find;
      merged_s[0].forEach((j: any, jindex) => {
        initCov.s[j] = Number(merged_s[1][jindex]);
      });

      merged_f[0].forEach((j: any, jindex) => {
        initCov.f[j] = Number(merged_f[1][jindex]);
      });

      merged_b[0].forEach((j: any, jindex) => {
        const realB = decodeKey(j);
        const [a, b] = realB;
        initCov.b[a] = [];
        initCov.b[a][b] = Number(merged_b[1][jindex]);
      });
    }

    r.push({
      path: initCov.path,
      b: initCov.b,
      f: initCov.f,
      s: initCov.s,
    });
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

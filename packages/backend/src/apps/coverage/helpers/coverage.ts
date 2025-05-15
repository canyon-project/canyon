// @ts-nocheck
import { decodeKey } from '../../../utils/ekey';

function mergeAndSum(obj1, obj2) {
  const merged = { ...obj1 };
  for (const [key, value] of Object.entries(obj2)) {
    merged[key] = Number(merged[key] || 0) + Number(value);
  }
  return merged;
}

export function convertClickHouseCoverageToIstanbul(
  arr: any[],
  fullFilePath: string,
) {
  return arr.reduce(
    (previousValue, currentValue, currentIndex, array) => {
      const { s: s1, f: f1, b: b1 } = currentValue;
      const { s: s2, f: f2, b: b2 } = previousValue;

      if (currentValue.s[0].length === 0) {
        return previousValue;
      }

      // NOTE: 这里需要用index，不能用key

      // [1,2,3,7,8] => [2,3,4,5,6]

      const s1_obj = s1[0].reduce((pre, cur, index) => {
        pre[cur] = s1[1][index];
        return pre
      }, {});

      const s2_obj = s2[0].reduce((pre, cur, index) => {
        pre[cur] = s2[1][index];
        return pre
      }, {});

      const s_obj = mergeAndSum(s1_obj, s2_obj);

      if (currentValue.fullFilePath.includes('src/api/utils.ts')) {
        // console.log(s);
      }

      const s = [[], []];

      Object.entries(s_obj).forEach(([key, value]) => {
        s[0].push(key);
        s[1].push(value);
      });

      const f = [[], []];

      f[0] = [...new Set([...f1[0], ...f2[0]])].sort();

      f[0].forEach((key, index) => {
        f[1][index] = Number(f1[1][index] || 0) + Number(f2[1][index] || 0);
      });

      const b = [[], []];

      b[0] = [...new Set([...b1[0], ...b2[0]])].sort();

      b[0].forEach((key, index) => {
        b[1][index] = Number(b1[1][index] || 0) + Number(b2[1][index] || 0);
      });

      return {
        ...previousValue,
        s: s,
        f: f,
        b: b,
      };
    },
    {
      fullFilePath: fullFilePath,
      b: [[], []],
      f: [[], []],
      s: [[], []],
    },
  );
}

export function fuzhi(find, initCov) {
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
  // console.log(find,initCov,'initCov')
  if (find.fullFilePath.includes('src/api/utils.ts')) {
    console.log(initCov.s);
  }

  return {
    path: initCov.path,
    b: initCov.b,
    f: initCov.f,
    s: initCov.s,
  };
}

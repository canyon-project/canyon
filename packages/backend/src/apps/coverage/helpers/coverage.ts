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

      // 处理 s
      const s1_obj = s1[0].reduce((pre, cur, index) => {
        pre[cur] = s1[1][index];
        return pre;
      }, {});

      const s2_obj = s2[0].reduce((pre, cur, index) => {
        pre[cur] = s2[1][index];
        return pre;
      }, {});

      const s_obj = mergeAndSum(s1_obj, s2_obj);
      const s = [[], []];
      Object.entries(s_obj).forEach(([key, value]) => {
        s[0].push(key);
        s[1].push(value);
      });

      // 重构 f 的处理
      const f1_obj = f1[0].reduce((pre, cur, index) => {
        pre[cur] = f1[1][index];
        return pre;
      }, {});

      const f2_obj = f2[0].reduce((pre, cur, index) => {
        pre[cur] = f2[1][index];
        return pre;
      }, {});

      const f_obj = mergeAndSum(f1_obj, f2_obj);
      const f = [[], []];
      Object.entries(f_obj).forEach(([key, value]) => {
        f[0].push(key);
        f[1].push(value);
      });

      // 重构 b 的处理
      const b1_obj = b1[0].reduce((pre, cur, index) => {
        pre[cur] = b1[1][index];
        return pre;
      }, {});

      const b2_obj = b2[0].reduce((pre, cur, index) => {
        pre[cur] = b2[1][index];
        return pre;
      }, {});

      const b_obj = mergeAndSum(b1_obj, b2_obj);
      const b = [[], []];
      Object.entries(b_obj).forEach(([key, value]) => {
        b[0].push(key);
        b[1].push(value);
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

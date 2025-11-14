// 覆盖率回溯，在覆盖率存储之前转换
// @ts-ignorer
import { remapCoverage } from 'canyon-map';

function eee(newMap, oldMap) {
  const o = {};
  Object.entries(newMap).forEach(([key, value]) => {
    o[key] = {
      // @ts-ignorer
      ...value,
      contentHash: oldMap[key]?.contentHash || '',
    };
  });
  return o;
}

export async function remapCoverageByOld(obj: any) {
  const aaa = await Promise.all(
    Object.values(obj).map((item) => {
      return remapCoverage({
        // @ts-ignorer
        [item.path]: item,
      })
        .then((res) => {
          return Object.values(res);
        })
        .then((res) => {
          return res[0];
        })
        .then((res) => {
          const r = {
            // @ts-ignorer
            ...res,
            // @ts-ignorer
            statementMap: eee(res.statementMap, item.statementMap),
            // @ts-ignorer
            fnMap: eee(res.fnMap, item.fnMap),
            // @ts-ignorer
            oldPath: item.path,
            // @ts-ignorer
            contentHash: item.contentHash,
          };
          return r;
        })
        .catch((err) => {
          return {};
        });
    }),
  );
  const obj2 = {};
  // @ts-ignorer
  aaa.forEach((item) => {
    // 过滤作用
    if (item.path) {
      // @ts-ignorer
      obj2[item.path] = item;
    }
  });
  return obj2;
}

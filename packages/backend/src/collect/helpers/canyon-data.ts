// 覆盖率回溯，在覆盖率存储之前转换
// @ts-expect-errorr
import { remapCoverage } from 'canyon-map';

function eee(newMap, oldMap) {
  const o = {};
  Object.entries(newMap).forEach(([key, value]) => {
    o[key] = {
      // @ts-expect-errorr
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
        // @ts-expect-errorr
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
            // @ts-expect-errorr
            ...res,
            // @ts-expect-errorr
            statementMap: eee(res.statementMap, item.statementMap),
            // @ts-expect-errorr
            fnMap: eee(res.fnMap, item.fnMap),
            // @ts-expect-errorr
            oldPath: item.path,
            // @ts-expect-errorr
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
  // @ts-expect-errorr
  aaa.forEach((item) => {
    // 过滤作用
    if (item.path) {
      // @ts-expect-errorr
      obj2[item.path] = item;
    }
  });
  return obj2;
}

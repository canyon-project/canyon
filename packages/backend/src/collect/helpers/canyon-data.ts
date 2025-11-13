// 覆盖率回溯，在覆盖率存储之前转换
// @ts-ignore
import { remapCoverage } from 'canyon-map';

function eee(newMap, oldMap) {
  const o = {};
  Object.entries(newMap).forEach(([key, value]) => {
    o[key] = {
      // @ts-ignore
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
        // @ts-ignore
        [item.path]: item,
      })
        .then((res) => {
          return Object.values(res);
        })
        .then((res) => {
          return res[0];
        })
        .then((res) => {
          console.log(res?.statementMap,'res')
          const r = {
            // @ts-ignore
            ...res,
            // @ts-ignore
            statementMap: eee(res.statementMap, item.statementMap),
            // @ts-ignore
            fnMap: eee(res.fnMap, item.fnMap),
            // @ts-ignore
            oldPath: item.path,
            // @ts-ignore
            contentHash: item.contentHash,
          };
          return r;
        });
    }),
  );
  const obj2 = {};
  // @ts-ignore
  aaa.forEach((item) => {
    // 过滤作用
    if (item.path) {
      // @ts-ignore
      obj2[item.path] = item;
    }
  });
  return obj2;
}

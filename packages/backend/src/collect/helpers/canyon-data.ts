// @ts-nocheck
import { remapCoverage } from 'canyon-map';

export async function remapCoverageByOld(obj: any) {
  const aaa = await Promise.all(
    Object.values(obj).map((item) => {
      return remapCoverage({
        // @ts-expect-error
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
            // @ts-expect-error
            ...res,
            // @ts-expect-error
            oldPath: item.path,
            // @ts-expect-error
          };
          return r;
        })
        .catch((err) => {
          return {};
        });
    }),
  );
  const obj2 = {};
  // @ts-expect-error
  aaa.forEach((item) => {
    // 过滤作用
    if (item.path) {
      // @ts-expect-error
      obj2[item.path] = item;
    }
  });
  return obj2;
}

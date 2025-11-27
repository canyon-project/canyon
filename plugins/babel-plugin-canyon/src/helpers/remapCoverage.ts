import libCoverage from 'istanbul-lib-coverage';
import libSourceMaps from 'istanbul-lib-source-maps';

export async function remapCoverage(obj: any) {
  const res = await libSourceMaps
    .createSourceMapStore()
    .transformCoverage(libCoverage.createCoverageMap(obj));
  const { data: data_1 } = res;
  const obj_1 = {};
  Object.entries(data_1).forEach(([key, value], index) => {
    // @ts-expect-error
    const x = value['data'];
    // @ts-expect-error
    obj_1[x.path] = {
      ...x,
    };
  });
  return obj_1;
}

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

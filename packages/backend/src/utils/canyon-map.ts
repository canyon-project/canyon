function genHitByMap(mapValue: any) {
  return {
    s: Object.entries(mapValue.statementMap).reduce(
      (accInside, [keyInside]) => {
        // @ts-ignore
        accInside[keyInside] = 0;
        return accInside;
      },
      {},
    ),
    f: Object.entries(mapValue.fnMap).reduce((accInside, [keyInside]) => {
      // @ts-ignore
      accInside[keyInside] = 0;
      return accInside;
    }, {}),
    b: Object.entries(mapValue.branchMap).reduce(
      (accInside, [keyInside, valueInside]: any) => {
        // @ts-ignore
        accInside[keyInside] = Array(valueInside.length).fill(0);
        return accInside;
      },
      {},
    ),
  };
}
export const reorganizeCompleteCoverageObjects = (
  map: {
    [key: string]: object;
  },
  hit: {
    [key: string]: object;
  },
) => {
  // 重组的时候以map为基准，map可能是只查询一部分。
  const obj = {};
  for (const mapKey in map) {
    if (hit[mapKey]) {
      // @ts-ignore
      obj[mapKey] = {
        ...map[mapKey],
        ...hit[mapKey],
        // @ts-ignore
        inputSourceMap: map[mapKey].inputSourceMap,
        path: mapKey,
      };
    } else {
      // @ts-ignore
      obj[mapKey] = {
        ...map[mapKey],
        ...genHitByMap(map[mapKey]),
        path: mapKey,
      };
    }
  }
  return obj;
};

export function genHitByMap(mapValue: any) {
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
        accInside[keyInside] = Array(
          // @ts-ignore
          valueInside.locations.length).fill(0)
        return accInside;
      },
      {},
    ),
  };
}

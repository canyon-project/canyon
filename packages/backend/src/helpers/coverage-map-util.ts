export function extractIstanbulData(obj) {
  const o = {
    statementMap: {},
    branchMap: {},
    fnMap: {},
    b: {},
    f: {},
  };

  Object.entries(obj.s).forEach(([k, v]: any) => {
    o.statementMap[k] = v.origin;
  });
  return o;
}

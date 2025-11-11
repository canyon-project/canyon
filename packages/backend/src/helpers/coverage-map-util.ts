export function extractIstanbulData(obj) {
  const o = {
    statementMap: {},
    branchMap: {},
    fnMap: {},
    b: {},
    f: {},
  };
  o.statementMap = obj.origin.statementMap;
  return o;
}

export function extractIstanbulData(obj) {
  const o = {
    statementMap: {},
    branchMap: {},
    fnMap: {},
    b: {},
    f: {},
  };
  o.statementMap = obj.origin.statementMap;
  o.fnMap = obj.origin.fnMap;
  return o;
}

import {genHitByMap} from "../../../utils/genHitByMap";
// 重组覆盖率hit、map数据
// NOTE: 核心是要以map为基准
export function restructureCoverageData(hit, map) {
  const baseFileCoverage = genHitByMap(map)

  Object.entries(baseFileCoverage.s).forEach(([keyIndex])=>{
    const key = keyIndex
    baseFileCoverage.s[key] = hit.s[key] || 0;
  })
  Object.entries(baseFileCoverage.f).forEach(([keyIndex])=>{
    const key = keyIndex
    baseFileCoverage.f[key] = hit.f[key] || 0;
  })
  Object.entries(baseFileCoverage.b).forEach(([keyIndex, value])=>{
    const key = keyIndex
    // @ts-ignore
    baseFileCoverage.b[key] = value.map((cKeyIndex, index) => {
      return hit.b[key]?.[index] || 0
    });
  })
  return {
    ...map,
    ...baseFileCoverage,
  };
}

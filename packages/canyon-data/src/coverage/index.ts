import libCoverage, {CoverageMapData} from "istanbul-lib-coverage";
/**
 * 合并两个覆盖率数据
 * @param first 第一个覆盖率数据
 * @param second 第二个覆盖率数据
 * @returns 合并过后的覆盖率数据
 */
export function mergeCoverageMap(first:CoverageMapData, second:CoverageMapData) {
  const map = libCoverage.createCoverageMap(JSON.parse(JSON.stringify(first)));
  map.merge(second);
  return JSON.parse(JSON.stringify(map.toJSON()));
}

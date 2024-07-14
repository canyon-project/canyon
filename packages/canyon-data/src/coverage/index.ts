// import libCoverage, {CoverageMapData} from "istanbul-lib-coverage";
// import {formatCoverageData} from "../utils/formatCoverageData.ts";
/**
 * 合并两个覆盖率数据
 * @param first 第一个覆盖率数据
 * @param second 第二个覆盖率数据
 * @returns 合并过后的覆盖率数据
 */
// export function mergeCoverageMap(first:CoverageMapData, second:CoverageMapData) {
//   const map = libCoverage.createCoverageMap(JSON.parse(JSON.stringify(formatCoverageData(first))));
//   map.merge(formatCoverageData(second));
//   return JSON.parse(JSON.stringify(map.toJSON()));
// }



/**
 * 合并两个相同文件的文件覆盖对象实例，确保执行计数正确。
 *
 * @method mergeFileCoverage
 * @static
 * @param {Object} first 给定文件的第一个文件覆盖对象
 * @param {Object} second 相同文件的第二个文件覆盖对象
 * @return {Object} 合并后的结果对象。请注意，输入对象不会被修改。
 */
function mergeFileCoverage(first:any, second:any) {
  const ret = JSON.parse(JSON.stringify(first));

  delete ret.l; // 移除派生信息

  Object.keys(second.s).forEach(function (k) {
    ret.s[k] += second.s[k];
  });

  Object.keys(second.f).forEach(function (k) {
    ret.f[k] += second.f[k];
  });

  Object.keys(second.b).forEach(function (k) {
    const retArray = ret.b[k];
    const secondArray = second.b[k];
    for (let i = 0; i < retArray.length; i += 1) {
      retArray[i] += secondArray[i];
    }
  });

  return ret;
}

/**
 * 合并两个覆盖对象，确保执行计数正确。
 *
 * @method mergeCoverage
 * @static
 * @param {Object} first 第一个覆盖对象
 * @param {Object} second 第二个覆盖对象
 * @return {Object} 合并后的结果对象。请注意，输入对象不会被修改。
 */
export function mergeCoverageMap(first:any, second:any) {
  if (!second) {
    return first;
  }

  const mergedCoverage = JSON.parse(JSON.stringify(first)); // 深拷贝 coverage，这样修改出来的是两个的合集
  Object.keys(second).forEach(function (filePath) {
    const original = first[filePath];
    const added = second[filePath];
    let result;

    if (original) {
      result = mergeFileCoverage(original, added);
    } else {
      result = added;
    }

    mergedCoverage[filePath] = result;
  });

  return mergedCoverage;
}

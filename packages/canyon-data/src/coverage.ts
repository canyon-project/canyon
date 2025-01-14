function genHitByMap(mapValue:any) {
  return {
    s: Object.entries(mapValue.statementMap).reduce((accInside, [keyInside]) => {
      // @ts-ignore
      accInside[keyInside] = 0;
      return accInside;
    }, {}),
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
  }
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
        path: mapKey,
      }
    } else {
      // @ts-ignore
      obj[mapKey] = {
        ...map[mapKey],
        ...genHitByMap(map[mapKey]),
        path: mapKey,
      }
    }
  }
  return obj;
};

export const resetCoverageDataMap = (coverageData:any)=> {
  return Object.entries(coverageData).reduce((acc, [key, value]: any) => {
    // @ts-ignore
    acc[key] = {
      ...value,
      s: Object.entries(value.statementMap).reduce((accInside, [keyInside]) => {
        // @ts-ignore
        accInside[keyInside] = 0;
        return accInside;
      }, {}),
      f: Object.entries(value.fnMap).reduce((accInside, [keyInside]) => {
        // @ts-ignore
        accInside[keyInside] = 0;
        return accInside;
      }, {}),
      b: Object.entries(value.branchMap).reduce(
        (accInside, [keyInside, valueInside]: any) => {
          // @ts-ignore
          accInside[keyInside] = Array(valueInside.length).fill(0);
          return accInside;
        },
        {},
      ),
    };
    return acc;
  }, {});
}

// 格式化数据
// 1. 去除掉url中的\u0000
// 2. 把branchMap中有错误的去掉
// 3. 入参是istanbul格式的数据
export const formatCoverageData = (coverage:any)=>{
  const obj = {};
  // const coverage = data;
  // 针对windows电脑，把反斜杠替换成正斜杠
  // 做数据过滤，去除 \u0000 字符
  for (const coverageKey in coverage) {
    if (!coverageKey.includes("\u0000")) {
      // @ts-ignore
      obj[coverageKey] = coverage[coverageKey];
    }
  }
  return removeStartEndNull(obj);
}

// TODO：在覆盖率map数据上来的时候，有必要做一次过滤，去掉start和end为空的情况。然后再交由zod进行校验，这里需要非常严格的校验。
// @ts-ignore
const removeStartEndNull = (coverage) => {
  const obj = {};
  Object.keys(coverage).forEach((key) => {
    const item = coverage[key];
    // 创建一个新的branchMap，用于存储处理后的结果
    const newBranchMap = {};

    Object.keys((item.branchMap||[])).forEach((statementKey) => {
      const locations = item.branchMap[statementKey].locations;
      const newLocations = [];

      for (let i = 0; i < locations.length; i++) {
        const location = locations[i];

        // 如果start和end都不为空对象，则保留该位置信息
        if (
          Object.keys(location.start).length !== 0 ||
          Object.keys(location.end).length !== 0
        ) {
          newLocations.push(location);
        }
      }

      // 将处理后的新位置信息存入新的branchMap
      if (newLocations.length > 0) {
        // @ts-ignore
        newBranchMap[statementKey] = {
          ...item.branchMap[statementKey],
          locations: newLocations,
        };
      }
    });
    // 如果新的branchMap有数据，则将其存入处理后的对象
    if (Object.keys(newBranchMap).length > 0) {
      // @ts-ignore
      obj[key] = {
        ...item,
        branchMap: newBranchMap,
      };
    } else {
      // @ts-ignore
      obj[key] = item;
    }
  });
  return obj;
}

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
  first = {
    b:{},
    f:{},
    s:{},
    ...first
  }
  second = {
    b:{},
    f:{},
    s:{},
    ...second
  }
  const ret = JSON.parse(JSON.stringify(first));

  delete ret.l; // 移除派生信息

  Object.keys(second.s).forEach(function (k) {
    if (ret.s[k]===undefined){
      ret.s[k] = second.s[k];
    } else {
      ret.s[k] += second.s[k];
    }
  });

  Object.keys(second.f).forEach(function (k) {
    if (ret.f[k]===undefined){
      ret.f[k] = second.f[k];
    } else {
      ret.f[k] += second.f[k];
    }
  });

  Object.keys(second.b).forEach(function (k) {
    if (ret.b[k]===undefined){
      ret.b[k] = JSON.parse(JSON.stringify(second.b[k]));
    } else {
      const retArray = ret.b[k];
      const secondArray = second.b[k];
      if (retArray){
        if (retArray.length>0){
          for (let i = 0; i < retArray.length; i += 1) {
            retArray[i] += secondArray[i];
          }
        }
      }
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

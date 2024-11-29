import libCoverage from "istanbul-lib-coverage";
import libSourceMaps from "istanbul-lib-source-maps";
// 覆盖率回溯，在覆盖率存储之前转换
export async function remapCoverage(obj: any) {
  const res = await libSourceMaps
    .createSourceMapStore()
    .transformCoverage(libCoverage.createCoverageMap(obj));
  const { data: data_1 } = res;
  const obj_1: any = {};
  for (const dataKey in data_1) {
    // @ts-ignore
    const x = data_1[dataKey]["data"];
    obj_1[x.path] = x;
  }
  return obj_1;
}

export const reorganizeCompleteCoverageObjects = (
  map: {
    [key: string]: object;
  },
  hit: {
    [key: string]: object;
  },
) => {
  // istanbul数据结构
  const obj = {};
  for (const objKey in hit) {
    const item = hit[objKey];
    const mapItem = map[objKey];
    // @ts-ignore
    obj[objKey] = {
      ...mapItem,
      // 一定要在下面!!!
      ...item,
      path: objKey,
    };
  }
  return obj;
  // return {};
};

// 回溯未经过reMapCoverage的数据，但是必须得传入插装路径，因为这里的noReMap是没有插装路径的
export const remapCoverageWithInstrumentCwd = async (noReMap:any, instrumentCwd:string) => {
  // 如果来自的插桩路径不同，要预处理！！！
  const obj = {};
  for (const key in noReMap) {
    const newKey = instrumentCwd + "/" + key;
    const item = noReMap[key];
    // @ts-ignore
    obj[newKey] = {
      ...item,
      path: newKey,
    };
  }

  const reMapedCov = await remapCoverage(obj);

  const obj2: any = {};
  for (const coverageKey in reMapedCov) {
    const newKey = coverageKey.replace(instrumentCwd + "/", "");
    obj2[newKey] = {
      ...reMapedCov[coverageKey],
      path: newKey,
    };
  }

  // 再把instrumentCwd去掉
  return obj2;
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

    Object.keys(item.branchMap).forEach((statementKey) => {
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

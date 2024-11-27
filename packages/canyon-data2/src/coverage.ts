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
export const remapCoverageWithInstrumentCwd = async (noReMap:any, inser:string) => {
  // 如果来自的插桩路径不同，要预处理！！！
  const obj = {};
  for (const key in noReMap) {
    const newKey = inser + "/" + key;
    const item = noReMap[key];
    // @ts-ignore
    obj[newKey] = {
      ...item,
      path: newKey,
    };
  }

  const reMapedCov = await remapCoverage(obj);

  const obj222: any = {};
  for (const coverageKey in reMapedCov) {
    const newKey = coverageKey.replace(inser + "/", "");
    obj222[newKey] = {
      ...reMapedCov[coverageKey],
      path: newKey,
    };
  }

  // 再把inser去掉
  return obj222;
};

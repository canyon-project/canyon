import libCoverage from "istanbul-lib-coverage";
import libSourceMaps from "istanbul-lib-source-maps";


export async function remapCoverage(obj:any) {
  const res = await libSourceMaps
    .createSourceMapStore()
    .transformCoverage(libCoverage.createCoverageMap(obj));
  const { data: data_1 } = res;
  const obj_1 = {};
  Object.entries(data_1).forEach(([key, value],index) => {
    // @ts-ignore
    const x = value["data"];
    // @ts-ignore
    obj_1[x.path] = {
      ...x,
    };
  });
  return obj_1
}


// 覆盖率回溯，在覆盖率存储之前转换
export async function remapCoverageByOld(obj:any) {
  const aaa = await Promise.all(Object.values(obj).map(item=>{
    return remapCoverage({
      // @ts-ignore
      [item.path]: item
    }).then(res=>{
      return Object.values(res)
    }).then(res=>{
      return res[0]
    }).then(res=>{
      return {
        // @ts-ignore
        ...res,
        // @ts-ignore
        oldPath: item.path
      }
    })
  }));
  const obj2 = {};
  // @ts-ignore
  aaa.forEach(item=>{
    // 过滤作用
    if (item.path) {
      // @ts-ignore
      obj2[item.path] = item
    }
  });
  return obj2;
}

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

  const reMapedCov = await remapCoverageByOld(obj);

  const obj2: any = {};
  for (const coverageKey in reMapedCov) {
    const newKey = coverageKey.replace(instrumentCwd + "/", "");
    // @ts-ignore
    const oldPath = reMapedCov[coverageKey].oldPath.replace(instrumentCwd + "/", "");
    obj2[newKey] = {
      // @ts-ignore
      ...reMapedCov[coverageKey],
      path: newKey,
      oldPath,
    };
  }

  // console.log(JSON.stringify(obj2));
  // 再把instrumentCwd去掉
  return obj2;
};

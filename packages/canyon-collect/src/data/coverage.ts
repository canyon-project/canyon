// 重组覆盖率数据
import { remapCoverage } from '../utils/coverage';

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
    obj[objKey] = {
      ...mapItem,
      ...item,
      path: objKey,
    };
  }
  return obj;
  // return {};
};

// 重要方法，回溯源码覆盖率数据
export const remapCoverage123 = async (noReMap, inser) => {
  // 如果来自的插桩路径不同，要预处理！！！
  const obj = {};
  for (const key in noReMap) {
    const newKey = inser + '/' + key;
    const item = noReMap[key];
    obj[newKey] = {
      ...item,
      path: newKey,
    };
  }

  const reMapedCov = await remapCoverage(obj);

  const obj222: any = {};
  for (const coverageKey in reMapedCov) {
    const newKey = coverageKey.replace(inser + '/', '');
    obj222[newKey] = {
      ...reMapedCov[coverageKey],
      path: newKey,
    };
  }

  // 再把inser去掉
  return obj222;
};

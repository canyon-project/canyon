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
    const x = data_1[dataKey]["data"];
    obj_1[x.path] = x;
  }
  return obj_1;
}

function parseInstrumentCwd(instrumentCwd) {
  if (instrumentCwd.includes("=>")) {
    const instrumentCwdSplit = instrumentCwd.split("=>");
    return [instrumentCwdSplit[0], instrumentCwdSplit[1]];
  } else {
    return [instrumentCwd, ""];
  }
}
function convertInstrumentCwd({ path, instrumentCwd, projectInstrumentCwd }) {
  if (!projectInstrumentCwd) {
    return path.replace(instrumentCwd, "");
  } else {
    // 这里需要解析一下instrumentCwd，如果包含"=>"，则需要替换。
    const [leftInstrumentCwd, rightInstrumentCwd] =
      parseInstrumentCwd(projectInstrumentCwd);
    return path
      .replace(instrumentCwd, "")
      .replace(leftInstrumentCwd, rightInstrumentCwd);
  }
}
// 格式化上报的覆盖率对象
export function formatReportObject(c: any) {
  // 去除斜杠\\
  const removeSlash = (x: any) =>
    JSON.parse(JSON.stringify(x).replace(/\\\\/g, "/"));
  // 暂时解决方案，需要解决sourceMap问题
  const coverage = removeSlash(c.coverage);
  const instrumentCwd = removeSlash(c.instrumentCwd);
  const projectInstrumentCwd = removeSlash(c.projectInstrumentCwd || "");
  const reversePath = (p: string) => {
    const a = convertInstrumentCwd({
      path: p,
      instrumentCwd,
      projectInstrumentCwd,
    });
    let b = "";
    // 从第二个字符开始
    for (let i = 1; i < a.length; i++) {
      b += a[i];
    }
    return "" + b;
  };
  const obj: any = {};
  for (const coverageKey in coverage) {
    obj[reversePath(coverageKey)] = {
      ...coverage[coverageKey],
      path: reversePath(coverageKey),
    };
  }

  // 确保修改成istanbul格式，去掉start、end为空的情况

  return {
    coverage: obj,
    instrumentCwd,
  };
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

export function resetCoverageDataMap(coverageData) {
  return Object.entries(coverageData).reduce((acc, [key, value]: any) => {
    acc[key] = {
      ...value,
      s: Object.entries(value.statementMap).reduce((accInside, [keyInside]) => {
        accInside[keyInside] = 0;
        return accInside;
      }, {}),
      f: Object.entries(value.fnMap).reduce((accInside, [keyInside]) => {
        accInside[keyInside] = 0;
        return accInside;
      }, {}),
      b: Object.entries(value.branchMap).reduce(
        (accInside, [keyInside, valueInside]: any) => {
          accInside[keyInside] = Array(valueInside.length).fill(0);
          return accInside;
        },
        {},
      ),
    };
    return acc;
  }, {});
}


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

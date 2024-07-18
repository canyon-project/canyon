import * as libCoverage from 'istanbul-lib-coverage';
import * as libSourceMaps from 'istanbul-lib-source-maps';
import { mergeCoverageMap as mergeCoverageMapOfCanyonData } from 'canyon-data';
// import { merge_coverage_json_str } from 'canyon-data';
function parseInstrumentCwd(instrumentCwd) {
  if (instrumentCwd.includes('=>')) {
    const instrumentCwdSplit = instrumentCwd.split('=>');
    return [instrumentCwdSplit[0], instrumentCwdSplit[1]];
  } else {
    return [instrumentCwd, ''];
  }
}
function convertInstrumentCwd({ path, instrumentCwd, projectInstrumentCwd }) {
  if (!projectInstrumentCwd) {
    return path.replace(instrumentCwd, '');
  } else {
    // 这里需要解析一下instrumentCwd，如果包含"=>"，则需要替换。
    const [leftInstrumentCwd, rightInstrumentCwd] =
      parseInstrumentCwd(projectInstrumentCwd);
    return path
      .replace(instrumentCwd, '')
      .replace(leftInstrumentCwd, rightInstrumentCwd);
  }
}
// 格式化上报的覆盖率对象
export async function formatReportObject(c: any) {
  // 去除斜杠\\
  const removeSlash = (x: any) =>
    JSON.parse(JSON.stringify(x).replace(/\\\\/g, '/'));
  const coverage = removeSlash(await remapCoverage(c.coverage));
  const instrumentCwd = removeSlash(c.instrumentCwd);
  const projectInstrumentCwd = removeSlash(c.projectInstrumentCwd);
  const reversePath = (p: string) => {
    const a = convertInstrumentCwd({
      path: p,
      instrumentCwd,
      projectInstrumentCwd,
    });
    let b = '';
    // 从第二个字符开始
    for (let i = 1; i < a.length; i++) {
      b += a[i];
    }
    return '~/' + b;
  };
  const obj: any = {};
  for (const coverageKey in coverage) {
    obj[reversePath(coverageKey)] = {
      ...coverage[coverageKey],
      path: reversePath(coverageKey),
    };
  }
  return {
    coverage: obj,
    instrumentCwd,
  };
}
// 覆盖率回溯，在覆盖率存储之前转换
async function remapCoverage(obj: any) {
  const res = await libSourceMaps
    .createSourceMapStore()
    .transformCoverage(libCoverage.createCoverageMap(obj));
  const { data: data_1 } = res;
  const obj_1: any = {};
  for (const dataKey in data_1) {
    const x = data_1[dataKey]['data'];
    obj_1[x.path] = x;
  }
  return obj_1;
}

function getJsonSize(jsonObj) {
  // 创建一个 TextEncoder 实例
  const encoder = new TextEncoder();

  // 将 JSON 对象转换为字符串
  const jsonString = JSON.stringify(jsonObj);

  // 将 JSON 字符串转换为字节数组
  const encodedJson = encoder.encode(jsonString);

  // 返回字节数组的长度
  return encodedJson.length / 1024 / 1024;
}

export const mergeCoverageMap = (cov1: any, cov2: any) => {
  // 超过2M的数据用js合并
  const size = getJsonSize(cov1);
  if (size > 0) {
    // console.log(`size of cov1: ${size}M`);
    return mergeCoverageMapOfCanyonData(cov1, cov2);
  } else {
    return mergeCoverageMapOfCanyonData(cov1, cov2);
    // return JSON.parse(
    //   merge_coverage_json_str(JSON.stringify(cov1), JSON.stringify(cov2)),
    // );
  }
};

export const filterStatementMap = (statementMap: any) => {
  const obj = {};
  Object.entries(statementMap).forEach(([key, value]: any) => {
    obj[key] = {
      start: {
        line: value.start.line,
      },
    };
  });
  return obj;
};

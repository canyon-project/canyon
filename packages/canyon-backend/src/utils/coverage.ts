import * as libCoverage from 'istanbul-lib-coverage';
import * as libSourceMaps from 'istanbul-lib-source-maps';

// 格式化上报的覆盖率对象
export async function formatReportObject(c: any) {
  // 去除斜杠\\
  const removeSlash = (x: any) =>
    JSON.parse(JSON.stringify(x).replace(/\\\\/g, '/'));
  const coverage = removeSlash(await remapCoverage(c.coverage));
  const instrumentCwd = removeSlash(c.instrumentCwd);
  const reversePath = (p: string) => {
    const a = p.replace(instrumentCwd, ``);
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

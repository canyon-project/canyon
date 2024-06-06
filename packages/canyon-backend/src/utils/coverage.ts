import * as libCoverage from 'istanbul-lib-coverage';
import * as libSourceMaps from 'istanbul-lib-source-maps';
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

export function validateObject(obj) {
  return Object.keys(obj).reduce((acc, item) => {
    return {
      ...acc,
      [item]: {
        ...obj[item],
        statementMap: obj[item].statementMap ? obj[item].statementMap : {},
        fnMap: obj[item].fnMap ? obj[item].fnMap : {},
        branchMap: obj[item].branchMap ? obj[item].branchMap : {},
        s: obj[item].s ? obj[item].s : {},
        f: obj[item].f ? obj[item].f : {},
        b: obj[item].b ? obj[item].b : {},
      },
    };
  }, {});

  // 检查对象是否具有所需的属性，如果不存在，则设置为空对象
  return {
    ...obj,
    statementMap: obj.statementMap ? obj.statementMap : {},
    fnMap: obj.fnMap ? obj.fnMap : {},
    branchMap: obj.branchMap ? obj.branchMap : {},
    s: obj.s ? obj.s : {},
    f: obj.f ? obj.f : {},
    b: obj.b ? obj.b : {},
  };
}

export function splitJSONIntoQuarters(jsonObject) {
  // 计算JSON对象的长度
  const length = Object.keys(jsonObject).length;

  // 计算四分之一的位置
  const quarterPosition = Math.ceil(length / 8);

  // 初始化四个部分的数据
  const quarters = [];
  for (let i = 0; i < 8; i++) {
    quarters[i] = {};
  }

  // 将原始JSON数据按照四分之一均匀分割到四个部分中
  let i = 0;
  let currentQuarterIndex = 0;
  for (const key in jsonObject) {
    if (!quarters[currentQuarterIndex]) {
      quarters[currentQuarterIndex] = {};
    }
    quarters[currentQuarterIndex][key] = jsonObject[key];
    i++;
    if (i % quarterPosition === 0) {
      currentQuarterIndex++;
    }
  }

  // 返回四个部分的数据
  return quarters;
}

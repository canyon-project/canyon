import libCoverage from 'istanbul-lib-coverage';
import libSourceMaps from 'istanbul-lib-source-maps';
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
export function formatReportObject(c: any) {
  // 去除斜杠\\
  const removeSlash = (x: any) =>
    JSON.parse(JSON.stringify(x).replace(/\\\\/g, '/'));
  // 暂时解决方案，需要解决sourceMap问题
  const coverage = removeSlash(c.coverage);
  const instrumentCwd = removeSlash(c.instrumentCwd);
  const projectInstrumentCwd = removeSlash(c.projectInstrumentCwd || '');
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
    return '' + b;
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

export function resetCoverageData(coverageData) {
  return Object.entries(coverageData).reduce((acc, [key, value]: any) => {
    acc[key] = {
      ...value,
      s: Object.entries(value.s).reduce((accInside, [keyInside]) => {
        accInside[keyInside] = 0;
        return accInside;
      }, {}),
      f: Object.entries(value.f).reduce((accInside, [keyInside]) => {
        accInside[keyInside] = 0;
        return accInside;
      }, {}),
      b: Object.entries(value.b).reduce(
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

export function regularData(data: any) {
  const obj = {};
  const coverage = data;
  // 针对windows电脑，把反斜杠替换成正斜杠
  // 做数据过滤，去除 \u0000 字符
  for (const coverageKey in coverage) {
    if (!coverageKey.includes('\u0000')) {
      obj[coverageKey] = coverage[coverageKey];
    }
  }
  return obj;
}

// TODO：在覆盖率map数据上来的时候，有必要做一次过滤，去掉start和end为空的情况。然后再交由zod进行校验，这里需要非常严格的校验。
export const removeStartEndNull = (coverage) => {
  const obj = {};
  Object.keys(coverage).forEach((key) => {
    const item = coverage[key];

    console.log(key);

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
        newBranchMap[statementKey] = {
          ...item.branchMap[statementKey],
          locations: newLocations,
        };
      }
    });

    // 如果新的branchMap有数据，则将其存入处理后的对象
    if (Object.keys(newBranchMap).length > 0) {
      obj[key] = {
        ...item,
        branchMap: newBranchMap,
      };
    } else {
      obj[key] = item;
    }
  });
  // fs.writeFileSync('./coverage.json', JSON.stringify(obj));
  // console.log(Object.keys(obj), 'obj');
  return obj;
};

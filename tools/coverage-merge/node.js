/**
 * 合并两个相同文件的文件覆盖对象实例，确保执行计数正确。
 *
 * @method mergeFileCoverage
 * @static
 * @param {Object} first 给定文件的第一个文件覆盖对象
 * @param {Object} second 相同文件的第二个文件覆盖对象
 * @return {Object} 合并后的结果对象。请注意，输入对象不会被修改。
 */
function mergeFileCoverage(first, second) {
  const ret = JSON.parse(JSON.stringify(first));

  delete ret.l; // 移除派生信息

  Object.keys(second.s).forEach(function (k) {
    ret.s[k] += second.s[k];
  });

  Object.keys(second.f).forEach(function (k) {
    ret.f[k] += second.f[k];
  });

  Object.keys(second.b).forEach(function (k) {
    const retArray = ret.b[k];
    const secondArray = second.b[k];
    for (let i = 0; i < retArray.length; i += 1) {
      retArray[i] += secondArray[i];
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
function mergeCoverage(first, second) {
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

const fs=require('fs');
const first=fs.readFileSync('./data/first.json','utf-8');
const second=fs.readFileSync('./data/second.json','utf-8');
console.log(JSON.parse(first)["/builds/canyon/canyon-demo/src/pages/Home.tsx"]['s']);
console.log(mergeCoverage(JSON.parse(first),JSON.parse(second))["/builds/canyon/canyon-demo/src/pages/Home.tsx"]['s']);

// 期望

// {
//   '0': 1,
//   '1': 1,
//   '2': 0,
//   '3': 1,
//   '4': 1,
//   '5': 1,
//   '6': 0,
//   '7': 0,
//   '8': 0,
//   '9': 0
// }
// {
//   '0': 2,
//   '1': 2,
//   '2': 0,
//   '3': 2,
//   '4': 2,
//   '5': 2,
//   '6': 0,
//   '7': 0,
//   '8': 0,
//   '9': 0
// }

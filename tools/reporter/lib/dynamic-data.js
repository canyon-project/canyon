const fs = require('fs');
const path = require('path');
const { getCommonPathPrefix } = require('./utils');
const { sourceMapFixer } = require('canyon-library-istanbul-coverage');

function getDirectoryFromPath(filePath) {
  return filePath.substring(0, filePath.lastIndexOf('/'));
}

const generateDynamicData = ({ coverage, instrumentCwd, targetDir }) => {
  const commonPath = getCommonPathPrefix(Object.keys(JSON.parse(coverage)));

  instrumentCwd = instrumentCwd || commonPath;

  // const newCoverage = sourceMapFixer(JSON.parse(coverage),instrumentCwd)
  const newCoverage = JSON.parse(coverage);
  for (const key in newCoverage) {
    // 示例
    const directory = getDirectoryFromPath(key.replaceAll(`${instrumentCwd}/`, ''));
    const base = path.join(targetDir || process.cwd(), `dynamic-data/${directory}`);
    fs.mkdirSync(base, { recursive: true });
    const data = fs.readFileSync(`${key}`, 'utf-8');
    const jsonData = {
      content: data,
      coverage: {
        ...newCoverage[key],
        path: key.replaceAll(`${instrumentCwd}/`, ''),
      },
    };
    fs.writeFileSync(
      path.join(
        targetDir || process.cwd(),
        `dynamic-data/${key.replaceAll(`${instrumentCwd}/`, '')}.js`
      ),
      `window["${key.replaceAll(`${instrumentCwd}/`, '')}"] = ${JSON.stringify(jsonData, null, 2)}`
    );
  }
};

module.exports = {
  generateDynamicData,
};

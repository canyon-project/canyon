const fs = require("fs");
const path = require("path");
const {getCommonPathPrefix} = require("./utils");
const {sourceMapFixer} = require("canyon-library-istanbul-coverage");

function getDirectoryFromPath(filePath) {
  return filePath.substring(0, filePath.lastIndexOf("/"));
}

const generateDynamicData = ({coverage,_instrumentCwd}) => {
  const commonPath = getCommonPathPrefix(Object.keys(JSON.parse(coverage)));

  const instrumentCwd = _instrumentCwd || commonPath;

  // const newCoverage = sourceMapFixer(JSON.parse(coverage),instrumentCwd)
  const newCoverage = JSON.parse(coverage);
  for (const key in newCoverage) {
    // 示例
    const directory = getDirectoryFromPath(key.replaceAll(instrumentCwd+'/', ""));
    fs.mkdirSync(path.join(process.cwd(), `coverage/dynamic-data/${directory}`), { recursive: true });
    const data = fs.readFileSync(
      `${key}`,
      "utf-8",
    );
    const jsonData = {
      content: data,
      coverage: {
        ...newCoverage[key],
        path: key.replaceAll(instrumentCwd+'/', ""),
      },
    };
    fs.writeFileSync(
      path.join(process.cwd(), `coverage/dynamic-data/${key.replaceAll(instrumentCwd+'/', "")}.js`),
      `window["${key.replaceAll(instrumentCwd+'/', "")}"] = ${JSON.stringify(jsonData,null,2)}`,
    );
  }

}

module.exports = {
  generateDynamicData
}

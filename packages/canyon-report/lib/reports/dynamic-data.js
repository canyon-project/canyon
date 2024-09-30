const fs = require("fs");
const path = require("path");

function getDirectoryFromPath(filePath) {
  return filePath.substring(0, filePath.lastIndexOf("/"));
}

const getCommonPathPrefix = (paths) => {
  if (paths.length === 0) return '';
  const splitPaths = paths.map(path => path.split('/'));
  const minLength = Math.min(...splitPaths.map(p => p.length));

  let commonPrefix = [];
  for (let i = 0; i < minLength; i++) {
    const segment = splitPaths[0][i];
    if (splitPaths.every(path => path[i] === segment)) {
      commonPrefix.push(segment);
    } else {
      break;
    }
  }
  return commonPrefix.join('/');
};


const generateDynamicData = ({coverage,_instrumentCwd}) => {

  const commonPath = getCommonPathPrefix(Object.keys(JSON.parse(coverage)));

  const instrumentCwd = _instrumentCwd || commonPath;

  for (const key in JSON.parse(coverage)) {
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
        ...coverage[key],
        path: key.replaceAll(instrumentCwd+'/', ""),
      },
    };
    fs.writeFileSync(
      path.join(process.cwd(), `coverage/dynamic-data/${key}.js`),
      `window["${key.replaceAll(instrumentCwd+'/', "")}"] = ${JSON.stringify(jsonData,null,2)}`,
    );
  }

}

module.exports = {
  generateDynamicData
}

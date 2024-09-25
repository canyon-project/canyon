const fs = require("fs");
const path = require("path");

function getDirectoryFromPath(filePath) {
  return filePath.substring(0, filePath.lastIndexOf("/"));
}

// path.join(process.cwd(), "coverage")

const generateDynamicData = ({coverage}) => {
  for (const key in JSON.parse(coverage)) {;
    // 示例
    const directory = getDirectoryFromPath(key);
    fs.mkdirSync(path.join(process.cwd(), `coverage/dynamic-data/${directory}`), { recursive: true });
    const data = fs.readFileSync(
      `${key}`,
      "utf-8",
    );
    const jsonData = {
      content: data,
      coverage: coverage[key],
    };
    fs.writeFileSync(
      path.join(process.cwd(), `coverage/dynamic-data/${key}.js`),
      `window["${key}"] = ${JSON.stringify(jsonData,null,2)}`,
    );
  }

}

module.exports = {
  generateDynamicData
}

const fs = require('fs')
const path = require('path');

function walkSync(currentDirPath, callback) {
  fs.readdirSync(currentDirPath, {withFileTypes: true}).forEach(function (dirent) {
    const filePath = path.join(currentDirPath, dirent.name);
    if (dirent.isFile()) {
      callback(filePath, dirent);
    } else if (dirent.isDirectory()) {
      walkSync(filePath, callback);
    }
  });
}

let tmp = {}
walkSync('templates', function (filePath, stat) {
  const rs = fs.readFileSync(filePath, "utf8");
  tmp[filePath] = rs
});

fs.writeFileSync('src/template.js', `export default ${JSON.stringify(tmp, null, 2)}`, "utf8")


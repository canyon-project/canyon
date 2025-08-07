const fs = require('fs');
const path = require('path');
function copyFile(source, target) {
  const readStream = fs.createReadStream(source);
  const writeStream = fs.createWriteStream(target);
  readStream.pipe(writeStream);
}

function copyDirectory(source, target) {
  fs.readdirSync(source).forEach((file) => {
    // 排出index.html文件
    if (file !== 'index.html') {
      const sourcePath = path.join(source, file);
      const targetPath = path.join(target, file);
      if (fs.statSync(sourcePath).isDirectory()) {
        if (!fs.existsSync(targetPath)) {
          fs.mkdirSync(targetPath, { recursive: true });
        }
        copyDirectory(sourcePath, targetPath);
      } else {
        copyFile(sourcePath, targetPath);
      }
    }
  });
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

module.exports = {
  copyDirectory,
  getCommonPathPrefix
}

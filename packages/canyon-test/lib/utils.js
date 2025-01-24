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

module.exports = {
  copyDirectory
}

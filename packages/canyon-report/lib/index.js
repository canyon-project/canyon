const fs = require('fs');
const path = require('path');
class CoverageReport {

    constructor(options = {}) {
        this.cacheDirName = '.cache';
        this.constructorOptions = options;
        this.options = {
            ... options
        };
        this.initOptions();
    }

    initOptions(force) {
      console.log('initOptions');
    }
    async add(data) {

        const time_start = Date.now();

        this.initOptions();

        return {};
    }
    // generate report
    async generate() {

        const time_start = Date.now();

        this.initOptions();

        console.log('generate report');


        // 复制dist/assets到coverage文件下


      const sourceDir = path.join(__dirname, '../dist');
      const targetDir = path.join(__dirname, '../coverage');

// 创建目标目录（如果不存在）
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      } else {
        // 如果存在，清空目标目录
        fs.rmSync(targetDir, { recursive: true });
        fs.mkdirSync(targetDir, { recursive: true });
      }

// 复制文件函数
      function copyFile(source, target) {
        const readStream = fs.createReadStream(source);
        const writeStream = fs.createWriteStream(target);
        readStream.pipe(writeStream);
      }

// 遍历源目录并复制文件
      function copyDirectory(source, target) {
        fs.readdirSync(source).forEach((file) => {
          const sourcePath = path.join(source, file);
          const targetPath = path.join(target, file);
          if (fs.statSync(sourcePath).isDirectory()) {
            // 如果是目录，递归复制
            if (!fs.existsSync(targetPath)) {
              fs.mkdirSync(targetPath, { recursive: true });
            }
            copyDirectory(sourcePath, targetPath);
          } else {
            // 如果是文件，进行复制
            copyFile(sourcePath, targetPath);
          }
        });
      }

      copyDirectory(sourceDir, targetDir);
      console.log('文件复制完成！');


        // 在coverage下生成index.html

      const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React</title>
  </head>
  <body>
    <div id="root"></div>
    <script src="v.mjs"></script>
  </body>
</html>
`;

      fs.writeFileSync(path.join(__dirname, '../coverage/index.html'), html);


        return {};
    }
}

const CCR = function(options) {
  return new CoverageReport(options);
};
module.exports = CCR;

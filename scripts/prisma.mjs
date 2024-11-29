import fs from 'fs';
import fse from 'fs-extra';

// 源文件目录路径
const sourceDirPath = './prisma';
// 目标文件目录路径
const targetDirPath = './packages/canyon-collect/prisma';

// 首先检查目标目录是否存在，如果存在则删除它（实现强制覆盖效果）
if (fs.existsSync(targetDirPath)) {
  fse.removeSync(targetDirPath);
}

// 然后复制源目录到目标目录
fse.copySync(sourceDirPath, targetDirPath);

console.log('文件目录已成功从', sourceDirPath, '复制到', targetDirPath);

// 然后复制源目录到目标目录
fse.copySync(sourceDirPath, './packages/canyon-platform/prisma');

console.log('文件目录已成功从', sourceDirPath, '复制到', targetDirPath);

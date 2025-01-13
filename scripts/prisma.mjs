import fs from 'fs';
import fse from 'fs-extra';

// Source file directory path
const sourceDirPath = './prisma';
// Target file directory path
const targetDirPath = './packages/canyon-collect/prisma';

// First, check whether the target directory exists. If it exists, delete it (to achieve the effect of forced overwrite).
if (fs.existsSync(targetDirPath)) {
    fse.removeSync(targetDirPath);
}

// Then copy the source directory to the target directory.
fse.copySync(sourceDirPath, targetDirPath);

console.log('The file directory has been successfully copied from', sourceDirPath, 'to', targetDirPath);

// Then copy the source directory to another target directory.
fse.copySync(sourceDirPath, './packages/canyon-backend/prisma');

console.log('The file directory has been successfully copied from', sourceDirPath, 'to', targetDirPath);

// Then copy the source directory to another target directory.
fse.copySync(sourceDirPath, './packages/canyon-ut/prisma');

console.log('The file directory has been successfully copied from', sourceDirPath, 'to', targetDirPath);

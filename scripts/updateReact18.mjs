import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
console.log(process.env.GITHUB_REF,'process.env.GITHUB_REF')
if (process.env.GITHUB_REF === 'pkg-react18'){
  // 定义 package.json 文件路径
  const packageJsonPath = join(process.cwd(), 'package.json');

  try {
    // 读取 package.json 文件内容
    const data = await readFile(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(data);

    // 检查 pnpm.overrides 是否存在
    if (packageJson.pnpm && packageJson.pnpm.overrides) {
      const overrides = packageJson.pnpm.overrides;
      for (const key in overrides) {
        if (key.includes('react') && typeof overrides[key] === 'string') {
          overrides[key] = overrides[key].replace(/19/g, '18');
        }
      }
    }

    // 将修改后的 JSON 对象转换为格式化的字符串
    const updatedPackageJson = JSON.stringify(packageJson, null, 2);

    // 将修改后的内容写回到 package.json 文件
    await writeFile(packageJsonPath, updatedPackageJson, 'utf8');
    console.log('成功将 pnpm.overrides 中的 React 版本从 19 替换为 18');
  } catch (error) {
    console.error('处理 package.json 文件时出错:', error);
  }
}

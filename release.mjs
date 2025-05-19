import { exec } from 'child_process';

// 接收命令行参数
const args = process.argv.slice(2);
const [version] = args;

// 执行命令
// v2.0.0-nightly-20250208.1

console.log('version:', version);

exec(`git tag ${version} ; git push origin ${version}`, (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(stdout);
  console.log(stderr);
});

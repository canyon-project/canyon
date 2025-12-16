import { exec } from 'node:child_process';
exec('git add . && git commit -m "chore: daily development"', (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(stdout);
  console.log(stderr);
});

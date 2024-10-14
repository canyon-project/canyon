import fs from 'fs';
import path from 'path';

function deleteNodeModules(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const curPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const time = new Date().getTime();
      if (entry.name === 'node_modules' || entry.name === 'dist') {
        fs.rmSync(curPath, { recursive: true, force: true })
        console.log(`deleting: ${curPath}, time consuming:${new Date().getTime() - time}`);
      } else {
        deleteNodeModules(curPath);
      }
    }
  }
}

const rootDirectory = process.cwd();
deleteNodeModules(rootDirectory);
fs.rmSync('./pnpm-lock.yaml', { recursive: true, force: true })

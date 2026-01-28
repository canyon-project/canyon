import fs from 'node:fs';
import path from 'node:path';

function deleteNodeModules(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const curPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const time = Date.now();
      if (
        entry.name === 'node_modules' ||
        entry.name === 'dist' ||
        entry.name === '.next' ||
        entry.name === '.turbo'
      ) {
        fs.rmSync(curPath, { recursive: true, force: true });
        console.log(
          `deleting: ${entry.name}, time consuming:${Date.now() - time}`,
        );
      } else {
        deleteNodeModules(curPath);
      }
    }
  }
}

const rootDirectory = process.cwd();
deleteNodeModules(rootDirectory);
fs.rmSync('./pnpm-lock.yaml', { recursive: true, force: true });

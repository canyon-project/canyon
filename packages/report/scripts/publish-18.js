#!/usr/bin/env node
// update-package.mjs

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packagePath = path.join(__dirname, '../package.json');

async function updatePackage() {
  try {
    // Read package.json
    const data = await fs.readFile(packagePath, 'utf8');
    const pkg = JSON.parse(data);

    // Update package name
    pkg.name = 'canyontest-report18';

    // Update React dependencies
    pkg.dependencies.react = '^18.3.1';
    pkg.dependencies['react-dom'] = '^18.3.1';

    // Update devDependencies
    pkg.devDependencies['@types/react'] = '^18.3.1';
    pkg.devDependencies['@types/react-dom'] = '^18.3.1';

    // Write back to package.json
    await fs.writeFile(packagePath, JSON.stringify(pkg, null, 2) + '\n');
    console.log('Successfully updated package.json');
  } catch (err) {
    console.error('Error updating package.json:', err);
    process.exit(1);
  }
}

updatePackage();

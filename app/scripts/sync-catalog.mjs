import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read pnpm-workspace.yaml
const workspacePath = path.resolve(__dirname, '../../pnpm-workspace.yaml');
const workspaceContent = fs.readFileSync(workspacePath, 'utf8');

// Parse YAML (simple parser for catalog section)
const catalogMatch = workspaceContent.match(/catalog:\n((?:  .+\n?)*)/);
if (!catalogMatch) {
  console.error('Catalog not found in pnpm-workspace.yaml');
  process.exit(1);
}

const catalogLines = catalogMatch[1].split('\n').filter(line => line.trim());
const catalog = {};

for (const line of catalogLines) {
  const match = line.match(/^  "?([^":]+)"?:\s*(.+)$/);
  if (match) {
    catalog[match[1]] = match[2];
  }
}

// Read app/package.json
const packageJsonPath = path.resolve(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Update dependencies and devDependencies
const updateDependencies = (deps) => {
  let updatedCount = 0;
  for (const [name, version] of Object.entries(deps)) {
    if (version === 'catalog:' && catalog[name]) {
      deps[name] = catalog[name];
      updatedCount++;
    }
  }
  return updatedCount;
};

const depsUpdated = updateDependencies(packageJson.dependencies || {});
const devDepsUpdated = updateDependencies(packageJson.devDependencies || {});

// Write back to package.json with formatting
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

console.log(`✅ Catalog synced successfully! Updated ${depsUpdated + devDepsUpdated} packages.`);

import fs from "node:fs";
import path from "node:path";

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  ".next",
  ".turbo",
]);

function setupEnvInDir(dir) {
  const examplePath = path.join(dir, ".env.example");
  const envPath = path.join(dir, ".env");

  if (fs.existsSync(examplePath) && !fs.existsSync(envPath)) {
    fs.copyFileSync(examplePath, envPath);
    console.log(`Created ${path.relative(process.cwd(), envPath)} from .env.example`);
  }
}

function walk(dir) {
  setupEnvInDir(dir);

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory() || SKIP_DIRS.has(entry.name)) {
      continue;
    }
    walk(path.join(dir, entry.name));
  }
}

walk(process.cwd());

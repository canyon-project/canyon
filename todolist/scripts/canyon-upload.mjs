import { execSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const cwd = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const kind = process.argv[2];

if (kind !== "init" && kind !== "client") {
  console.error("Usage: node scripts/canyon-upload.mjs <init|client>");
  process.exit(1);
}

const dsnBase = (process.env.CANYON_DSN || "http://127.0.0.1:3000").replace(/\/$/, "");
const endpoint =
  kind === "init" ? `${dsnBase}/api/coverage/map/init` : `${dsnBase}/api/coverage/client`;

const sha =
  process.env.GITHUB_SHA ||
  process.env.CI_COMMIT_SHA ||
  execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
const repoId = process.env.GITHUB_REPOSITORY || process.env.CI_PROJECT_ID || "todolist";
const provider = process.env.CANYON_PROVIDER || "github";

const sourceDir = path.join(cwd, ".canyon_output");
if (!fs.existsSync(sourceDir)) {
  console.error(`Missing coverage directory: ${sourceDir}`);
  process.exit(1);
}

const files = fs.readdirSync(sourceDir).filter((name) => {
  if (!name.endsWith(".json")) return false;
  const isInit = /^coverage-final-.*\.json$/.test(name);
  return kind === "init" ? isInit : !isInit;
});

if (files.length === 0) {
  console.error(`No ${kind} coverage files found in .canyon_output`);
  process.exit(1);
}

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `canyon-${kind}-`));
for (const file of files) {
  fs.copyFileSync(path.join(sourceDir, file), path.join(tempDir, file));
}

const result = spawnSync(
  "pnpm",
  [
    "exec",
    "canyon",
    "upload",
    `--dsn=${endpoint}`,
    `--repo_id=${repoId}`,
    `--sha=${sha}`,
    `--provider=${provider}`,
    `--coverage-dir=${tempDir}`,
  ],
  { cwd, encoding: "utf8" },
);

fs.rmSync(tempDir, { recursive: true, force: true });

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);

const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
if (result.status !== 0 || output.includes('"success":false')) {
  process.exit(result.status && result.status !== 0 ? result.status : 1);
}

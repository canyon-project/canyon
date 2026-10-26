import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "@playwright/test";

import { realAppDir } from "./shared/paths.js";

const e2eRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  testDir: path.join(e2eRoot, "scenarios"),
  fullyParallel: false,
  workers: 1,
  timeout: 120_000,
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm exec serve . -p 4173 --no-clipboard",
    cwd: realAppDir,
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: "real-project",
      testMatch: /real-project\/.*\.spec\.ts/,
    },
  ],
});

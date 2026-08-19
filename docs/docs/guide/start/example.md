# Todolist example

`todolist` is a webpack + Babel + TypeScript app used to prove the coverage pipeline.

## What it does

1. Compiles TypeScript, then bundles with webpack and Babel.
2. Babel applies `babel-plugin-istanbul` and `@canyonjs/babel-plugin`.
3. `canyon:init` uploads `coverage-final-*.json` from `.canyon_output` to `/api/coverage/map/init`.
4. Playwright runs E2E tests and `@canyonjs/playwright` writes client coverage JSON.
5. `canyon:client` uploads those files to `/api/coverage/client`.

## Run locally

Start the API first (see [Getting Started](/guide/start/getting-started)). Then:

```bash
cd todolist
pnpm exec playwright install --with-deps chromium
CANYON_DSN=http://127.0.0.1:3000 pnpm test
```

`pnpm test` runs:

```bash
rm -rf .canyon_output && npm run build && npm run canyon:init && npm run test:e2e && npm run canyon:client
```

## Instrumentation

`todolist/babel.config.js` enables Istanbul and Canyon metadata:

```js
module.exports = {
  plugins: [
    "istanbul",
    [
      "@canyonjs",
      {
        keepMap: true,
        ci: true,
        provider: process.env.CANYON_PROVIDER || "github",
        repoID: process.env.GITHUB_REPOSITORY || process.env.CI_PROJECT_ID || "todolist",
        sha: process.env.GITHUB_SHA || process.env.CI_COMMIT_SHA || "",
        instrumentCwd: process.cwd(),
      },
    ],
  ],
};
```

## Playwright fixture

`todolist/e2e/fixtures.ts` collects coverage into `.canyon_output`:

```ts
import { test as base } from "@playwright/test";
import { createCoverageContextFixture } from "@canyonjs/playwright";

export const test = base.extend({
  context: async ({ context }, use) => {
    const collect = createCoverageContextFixture({
      outputDir: ".canyon_output",
    });
    await collect({ context }, use);
  },
});
```

## GitHub Actions

The workflow in `.github/workflows/ci.yml`:

1. Installs dependencies and Chromium
2. Runs `prisma db push` in `api`
3. Starts the API on port 3000
4. Runs `pnpm test` in `todolist` with `CANYON_DSN=http://127.0.0.1:3000`

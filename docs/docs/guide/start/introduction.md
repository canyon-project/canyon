# Introduction

Canyon is a JavaScript coverage collection service. It stores Istanbul-style coverage maps from instrumented builds, then merges runtime hit data from tests or browsers.

This repository is a pnpm monorepo:

| Package | Role |
| --- | --- |
| `api` | Hono HTTP server that stores coverage in SQLite |
| `todolist` | Example app with Babel instrumentation and Playwright E2E |
| `docs` | This documentation site (Rspress) |

## What Canyon collects

Canyon expects Istanbul coverage objects keyed by file path. Each file entry can include:

- `s`, `f`, `b` — statement, function, and branch hit counts
- `statementMap`, `fnMap`, `branchMap` — source location maps
- `inputSourceMap` — optional source map
- `buildHash`, `sha`, `provider`, `repoID`, `instrumentCwd`, `buildTarget` — build metadata

## Typical flow

1. Instrument the application with Istanbul and `@canyonjs/babel-plugin`.
2. Upload the **coverage map** with `POST /api/coverage/map/init`.
3. Run tests (for example Playwright with `@canyonjs/playwright`).
4. Upload **client hits** with `POST /api/coverage/client`.

The client upload requires a matching `buildHash` that was created during map initialization.

## Ecosystem packages

The example app uses these published Canyon packages:

- [`@canyonjs/babel-plugin`](https://www.npmjs.com/package/@canyonjs/babel-plugin) — attach build metadata during instrumentation
- [`@canyonjs/cli`](https://www.npmjs.com/package/@canyonjs/cli) — upload coverage JSON to the API
- [`@canyonjs/playwright`](https://www.npmjs.com/package/@canyonjs/playwright) — collect browser coverage in Playwright

Go to [Getting Started](/guide/start/getting-started) to run the API locally.

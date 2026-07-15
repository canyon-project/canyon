---
description: How buildHash is derived from CI repo / commit / provider fields and joins maps with hits.
---

# BuildHash

`buildHash` is Canyon’s build identity. It joins **CI commit / repo metadata** with **instrumented artifacts, initial maps, and runtime hits**.

## Why it exists

In E2E environments you often only have bundled JS, not a full source tree. Canyon avoids stuffing large metadata into the bundle:

1. Compute a stable `buildHash` at instrumentation time
2. Persist `repoID`, `sha`, `provider`, `buildTarget`, `instrumentCwd` into `.canyon_output` map files
3. Runtime hits carry only `buildHash`
4. The server looks up source + maps by `buildHash` when rendering reports

## How it is computed

`@canyonjs/babel-plugin` SHA-1 hashes a stable serialization of:

| Field | Meaning |
| --- | --- |
| `provider` | SCM provider (`gitlab` / `github`) |
| `repoID` | Repository id |
| `sha` | CI commit SHA |
| `buildTarget` | Distinguishes multi-target builds |
| `instrumentCwd` | Instrumentation working directory |

```ts
// Conceptual — matches generateBuildHash in the plugin
buildHash = sha1(stableStringify({
  provider,
  repoID,
  sha,
  buildTarget,
  instrumentCwd,
}))
```

`json-stable-stringify` keeps key order stable across plugin and server.

## CI auto-detection

| Environment | provider | repoID | sha |
| --- | --- | --- | --- |
| GitLab CI | `gitlab` | `CI_PROJECT_ID` / `CI_PROJECT_PATH` | `CI_COMMIT_SHA` |
| GitHub Actions | `github` | `GITHUB_REPOSITORY_ID` / `GITHUB_REPOSITORY` | `GITHUB_SHA` |

When `CI` / `GITLAB_CI` / `GITHUB_ACTIONS` is set, `ci` defaults to `true` and `.canyon_output` is written.

## What lands where

- **Runtime coverage object**: `buildHash` injected; map fields removed by default
- **`.canyon_output/*.json`**: full map plus `buildHash` and core CI fields

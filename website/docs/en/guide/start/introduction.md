---
description: Canyon is a JavaScript code coverage solution for E2E and UI automation.
---

# Introduction

Canyon is a **JavaScript code coverage solution** focused on **per–test-case** coverage for end-to-end (E2E) and UI automation workflows.

## Problems it solves

Classic Istanbul / V8 setups often assume tests and source live in the same repo and process. Frontend E2E usually does not:

- Built artifacts are separated from the test repo, so mapping back to source is hard
- UI automation produces huge volumes of hit data
- Teams need coverage **per case / scene**, not only a single aggregated total

Canyon addresses this with **CI commit binding**, **Hit/Map separation**, **buildHash**, **Scene tagging**, and **Scene Hash aggregation**.

## Capabilities

| Capability | Description |
| --- | --- |
| CI ↔ Commit | Bind the current commit id to JS source during CI builds |
| Hit / Map split | Strip maps at instrumentation time to shrink artifacts |
| buildHash | Tie maps, hits, and source versions together |
| Scene | Categorize hits with key/value labels per case |
| Aggregation | Merge identical scene hashes before report generation |
| Formats | Accept V8 and Istanbul.js coverage inputs |

## Components

- **Plugins** (e.g. [`@canyonjs/babel-plugin`](/guide/ecosystem/babel-plugin)): instrument in CI, write initial maps, inject `buildHash`
- **Collection**: report lightweight hits with scene + buildHash at runtime
- **Server / reports**: restore source and maps via buildHash, aggregate scenes, emit coverage artifacts

## Next steps

- Read the [architecture](/guide/concepts/architecture)
- Follow [Getting Started](/guide/start/getting-started)
- See the [Babel Plugin API](/api/babel-plugin)

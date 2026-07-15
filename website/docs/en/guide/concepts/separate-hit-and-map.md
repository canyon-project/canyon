---
description: Split hit and map during AST instrumentation to shrink artifacts and upload static coverage early.
---

# Separate Hit and Map

Istanbul-style coverage has two parts:

| Kind | Contents | When known |
| --- | --- | --- |
| **Map** | `statementMap` / `fnMap` / `branchMap` / `inputSourceMap` | At compile time |
| **Hit** | `s` / `f` / `b` counters | At runtime |

Canyon splits them during CI instrumentation.

## What the plugin does

After Istanbul instrumentation, `@canyonjs/babel-plugin`:

1. Extracts full `coverageData` (including maps)
2. When `ci: true`, writes `.canyon_output/coverage-final-init-*.json`
3. With default `keepMap: false`, removes from the runtime object:
   - `statementMap`, `fnMap`, `branchMap`, `inputSourceMap`, `hash`, `_coverageSchema`
4. Appends `buildHash`

## Benefits

- Smaller bundles
- Cheaper runtime uploads (hits only)
- Maps uploaded in CI, avoiding bandwidth spikes during UI automation

## Upload maps in CI

```yaml
script:
  - npm run build
  - npx @canyonjs/cli upload --dsn=https://app.canyonjs.io/api/coverage/map/init
```

## Keeping maps

Set `keepMap: true` for local debugging. Prefer `false` for CI / production collection paths.

---
description: Canyon accepts V8 and Istanbul.js coverage data formats.
---

# Data Formats

Canyon accepts two common coverage inputs on the collection / ingest path:

## Istanbul.js

```js
{
  path: 'src/app.ts',
  statementMap: { /* ... */ },
  fnMap: { /* ... */ },
  branchMap: { /* ... */ },
  s: { '0': 1, '1': 0 },
  f: { '0': 1 },
  b: { '0': [1, 0] },
  // Canyon extension:
  buildHash: '...'
}
```

The Babel path (`babel-plugin-istanbul` + `@canyonjs/babel-plugin`) produces Istanbul structures. After Hit/Map separation, runtime objects mainly keep `s` / `f` / `b` plus `buildHash`.

## V8

V8 coverage (e.g. Node / Chromium `Profiler.takePreciseCoverage`) describes hits by function and byte ranges. Canyon accepts V8 payloads and folds them into the same association / aggregation pipeline via `buildHash` and scene metadata.

## Guidance

| Scenario | Suggestion |
| --- | --- |
| Frontend Babel / Vite / Webpack | Istanbul (richest plugin ecosystem) |
| Node / native V8 collection | Report V8 directly, or convert first |
| Mixed stacks | Always attach `buildHash` + scene |

Regardless of format, **CI commit binding** and **scene grouping** semantics stay the same.

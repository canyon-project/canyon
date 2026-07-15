---
description: Install the Babel plugin, upload maps in CI, and report hits by Scene at runtime.
---

# Getting Started

This walkthrough uses Babel + Istanbul for the smallest Canyon loop.

## 1. Install

```bash
npm install -D babel-plugin-istanbul @canyonjs/babel-plugin
```

## 2. Configure Babel

Place the Canyon plugin **after** istanbul so it can strip maps and inject `buildHash`:

```js
// babel.config.js
module.exports = {
  plugins:
    process.env.CI
      ? [
          'istanbul',
          [
            '@canyonjs/babel-plugin',
            {
              // Usually auto-detected in CI; set explicitly for local debugging
              keepMap: false,
            },
          ],
        ]
      : [],
};
```

:::tip Plugin order

`istanbul` must come first, then `@canyonjs/babel-plugin`. Canyon rewrites the Istanbul `coverageData` object.

:::

## 3. Build in CI and upload the initial map

During a CI build the plugin will:

1. Read CI env vars (GitLab / GitHub) and bind the **commit SHA**
2. Compute `buildHash`
3. Write full maps to `.canyon_output/`
4. Remove maps from the runtime bundle, keeping hit counters + `buildHash`

Upload maps:

```yaml
# .gitlab-ci.yml (example)
pages:
  image: node:20
  stage: deploy
  script:
    - npm run build
    - npx @canyonjs/cli upload --dsn=https://app.canyonjs.io/api/coverage/map/init
  only:
    - main
```

## 4. Collect hits with Scene at runtime

After deploying the instrumented app, load the collect script and tag the current case with **scene key/value** pairs:

```html
<script src="https://unpkg.com/@canyonjs/collect/dist/index.iife.js"></script>
<script>
  window.CANYON_DSN = 'https://app.canyonjs.io/api/coverage/client';
  window.CANYON_SCENE = {
    suite: 'checkout',
    caseId: 'pay-success',
  };
</script>
```

The client uploads lightweight hits + `buildHash` + scene; the server resolves source and maps via `buildHash`.

## 5. Verify

After building, open the page and inspect `window.__coverage__`:

- Coverage objects should exist
- With default `keepMap: false`, large map fields should be gone
- `buildHash` should be present

## Next steps

- [Architecture](/guide/concepts/architecture)
- [BuildHash](/guide/concepts/build-hash)
- [Separate Hit and Map](/guide/concepts/separate-hit-and-map)
- [Babel Plugin](/guide/ecosystem/babel-plugin)

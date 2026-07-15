---
description: What @canyonjs/babel-plugin does and how to use it in CI.
---

# @canyonjs/babel-plugin

[`@canyonjs/babel-plugin`](https://www.npmjs.com/package/@canyonjs/babel-plugin) is Canyon’s Babel instrumentation plugin. Together with `babel-plugin-istanbul` it:

1. **Detects CI env** — reads GitLab / GitHub variables and binds the commit
2. **Separates Hit / Map** — strips maps from artifacts by default
3. **Injects buildHash** — lightweight identity on runtime coverage objects
4. **Writes initial maps** — when `ci: true`, outputs `.canyon_output/`

## Install

```bash
npm install -D @canyonjs/babel-plugin babel-plugin-istanbul
```

## Usage

```js
// babel.config.js
module.exports = {
  plugins: [
    'istanbul',
    [
      '@canyonjs/babel-plugin',
      {
        keepMap: false,
        include: ['src/**/*.{js,ts,tsx}'],
        exclude: ['**/*.{test,spec}.{js,ts,tsx}'],
      },
    ],
  ],
};
```

:::warning Order

`@canyonjs/babel-plugin` **must** come after `istanbul`.

:::

## Options

See [API: Babel Plugin](/api/babel-plugin).

| Option | Description | Default |
| --- | --- | --- |
| `repoID` | Repository id (CI auto-detect) | `""` |
| `sha` | Commit SHA (CI auto-detect) | `""` |
| `provider` | `gitlab` / `github` | `""` |
| `buildTarget` | Multi-target discriminator | `""` |
| `ci` | Write `.canyon_output` | auto `true` in CI |
| `instrumentCwd` | Instrumentation cwd | `process.cwd()` |
| `include` / `exclude` | File globs (Istanbul semantics) | `[]` |
| `extensions` | Extensions for matching | `.js` `.ts` `.tsx` … |
| `keepMap` | Keep maps in the bundle | `false` |

## CI behavior

When `ci === true`, each instrumented file writes something like:

```text
.canyon_output/coverage-final-init-<random>.json
```

containing the full map plus `buildHash` and core CI fields. Upload with `@canyonjs/cli`.

## Vite

For Vite, prefer [`@canyonjs/vite-plugin`](https://www.npmjs.com/package/@canyonjs/vite-plugin), which reuses this plugin internally.

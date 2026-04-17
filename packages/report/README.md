# @canyonjs/report

An [Istanbul](https://istanbul.js.org/) reporter that emits the **Canyon interactive HTML coverage report**. It extends `istanbul-lib-report`’s `ReportBase`, aggregates per-file coverage, enriches it with optional Git diff metadata, and writes a self-contained site (from `@canyonjs/report-html`) plus compressed `report-data.js` for the UI.

## Features

- **Rich HTML report** — Copies the bundled `@canyonjs/report-html` assets into the output directory and generates `data/report-data.js` with gzip-compressed coverage payload.
- **Diff-aware metrics** — If you supply a unified diff (see below), the report can align coverage with changed lines and surface **changed-line / “new lines”** style summaries (via `canyon-data`).
- **`canyon.json`** — When applicable, writes `newlinesPercent` next to `index.html` for downstream tooling.

## Installation

```bash
npm install @canyonjs/report @canyonjs/report-html
```

`@canyonjs/report-html` is a runtime dependency: the reporter resolves its `dist` folder and copies it into your coverage output directory.

## Usage

Register `@canyonjs/report` as an Istanbul reporter wherever your toolchain exposes Istanbul-compatible reporters (Vitest, nyc, Jest, c8, etc.).

### Vitest

```ts
// vitest.config.ts
export default {
  test: {
    coverage: {
      provider: "istanbul",
      reporter: ["json", "@canyonjs/report"],
    },
  },
};
```

### nyc

```json
{
  "reporter": ["json", "@canyonjs/report"]
}
```

Or CLI: `nyc --reporter=@canyonjs/report …`

### Jest / c8

Use each tool’s `coverageReporters` (or equivalent) and include `"@canyonjs/report"` alongside `"json"` if you still need raw JSON output.

## Optional: diff input

To correlate coverage with a patch, pass **unified diff** text via reporter options (when supported) or place a **`diff.txt`** file in the **current working directory** when the reporter runs. If no inline diff is configured, the reporter tries to read `./diff.txt` automatically.

The diff is parsed with [`parse-diff`](https://www.npmjs.com/package/parse-diff) to map additions/deletions per file.

## Output layout

Typical output directory (e.g. `coverage/`):

- `index.html` — Entry for the Canyon report UI  
- `data/report-data.js` — `window.reportData` payload (compressed)  
- `canyon.json` — Optional; includes `newlinesPercent` when computed  
- Additional assets copied from `@canyonjs/report-html/dist`

The console logs the resolved report path when generation finishes.

## Development

```bash
pnpm install
pnpm run build
pnpm test
```

## License

MIT — see the [repository](https://github.com/canyon-project/canyon) for details.

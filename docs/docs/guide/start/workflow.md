# Coverage workflow

Canyon splits coverage into **maps** and **hits**.

```
Instrument build
      │
      ▼
POST /api/coverage/map/init     # store statement/fn/branch maps + metadata
      │
      ▼
Run tests / browse the app
      │
      ▼
POST /api/coverage/client       # merge hit counts for a scene
```

## Build identity

A `buildHash` identifies one instrumented build. It is taken from coverage entries when present. Otherwise the API computes it from:

- `sha`
- `provider`
- `repoID`
- `instrumentCwd`
- `buildTarget` (optional)

Client uploads that do not match an existing `buildHash` are rejected. Initialize the map first.

## Scenes

Client coverage can include a `scene` object. Canyon hashes it into a `sceneKey` (SHA-1 of a stable JSON serialization). Hits for the same file and build are stored and merged per scene:

```
coverage record id:  {buildHash}|{sceneKey}
hit record id:       {buildHash}|{sceneKey}|{filePath}
```

An empty `scene` (`{}`) is valid. Map initialization also creates a record with an empty scene.

## Hit merging

When the same file is uploaded again for the same `buildHash` and `sceneKey`, statement and function counts are added together. Branch arrays are added element-wise.

## Filtering on client upload

`POST /api/coverage/client` keeps only file entries that:

1. Include a `buildHash` field
2. Have a non-empty `s` object with at least one non-zero statement hit

Files with all-zero statement hits are dropped.

## Environment variables used by the example uploader

| Variable | Purpose | Fallback |
| --- | --- | --- |
| `CANYON_DSN` | API origin, without a trailing slash | `http://127.0.0.1:3000` |
| `CANYON_PROVIDER` | Git provider name | `github` |
| `GITHUB_SHA` / `CI_COMMIT_SHA` | Commit SHA | `git rev-parse HEAD` |
| `GITHUB_REPOSITORY` / `CI_PROJECT_ID` | Repository id | `todolist` |

The example script in `todolist/scripts/canyon-upload.mjs` calls `canyon upload` against:

- `{CANYON_DSN}/api/coverage/map/init` for init files named `coverage-final-*.json`
- `{CANYON_DSN}/api/coverage/client` for other JSON files in `.canyon_output`

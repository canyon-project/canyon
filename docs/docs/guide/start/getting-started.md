# Getting started

## Prerequisites

- Node.js 22+
- [pnpm](https://pnpm.io/) 10+

## Install

From the repository root:

```bash
pnpm install
```

This also runs `prisma generate` for the API package.

## Configure the API

Copy the example env file:

```bash
cp api/.env.example api/.env
```

Default values:

```bash
DATABASE_URL="file:./dev.db"
PORT=3000
```

Create the SQLite schema:

```bash
pnpm --filter api db:push
```

## Start the API

```bash
pnpm --filter api dev
```

The server listens on `http://localhost:3000` by default.

Check that it is healthy:

```bash
curl http://127.0.0.1:3000/api/health
```

Expected response:

```json
{ "ok": true }
```

## Documentation site

From `docs/`:

```bash
pnpm --filter rspress-doc-template dev
```

Or from the docs package directory:

```bash
pnpm dev
```

## Next steps

- Learn the [coverage workflow](/guide/start/workflow).
- Run the [todolist example](/guide/start/example).
- Read the [HTTP API](/api/).

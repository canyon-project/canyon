import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  Kysely,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
  type CompiledQuery,
  type DatabaseConnection,
  type Driver,
  type QueryResult,
} from "kysely";
import { FileMigrationProvider } from "kysely/migration";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationFolder = path.join(__dirname, "migrations");

function formatParam(value: unknown): string {
  if (value === null || value === undefined) {
    return "NULL";
  }
  if (typeof value === "string") {
    return `'${value.replaceAll("'", "''")}'`;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return String(value);
}

/** 将 Kysely 编译结果转为可执行的 DDL 字符串（无占位符） */
function formatCompiledQuery(compiledQuery: CompiledQuery): string {
  let sql = compiledQuery.sql.trim();
  const { parameters } = compiledQuery;
  for (let i = parameters.length; i >= 1; i--) {
    sql = sql.replaceAll(`$${i}`, formatParam(parameters[i - 1]));
  }
  return sql.endsWith(";") ? sql : `${sql};`;
}

function createCaptureDriver(collector: string[]): Driver {
  class CaptureConnection implements DatabaseConnection {
    async executeQuery(compiledQuery: CompiledQuery) {
      collector.push(formatCompiledQuery(compiledQuery));
      return { rows: [] };
    }

    async *streamQuery<R>(): AsyncIterableIterator<QueryResult<R>> {
      // 迁移 DDL 不走流式查询
    }
  }

  class CaptureDriver implements Driver {
    async init() {}

    async acquireConnection(): Promise<DatabaseConnection> {
      return new CaptureConnection();
    }

    async beginTransaction() {}
    async commitTransaction() {}
    async rollbackTransaction() {}
    async releaseConnection() {}
    async destroy() {}
    async releaseSavepoint() {}
    async rollbackToSavepoint() {}
    async savepoint() {}
  }

  return new CaptureDriver();
}

function createDumpDb(collector: string[]): Kysely<unknown> {
  return new Kysely({
    dialect: {
      createAdapter: () => new PostgresAdapter(),
      createDriver: () => createCaptureDriver(collector),
      createIntrospector: (db) => new PostgresIntrospector(db),
      createQueryCompiler: () => new PostgresQueryCompiler(),
    },
  });
}

const provider = new FileMigrationProvider({
  fs,
  path,
  migrationFolder,
  import: (filePath) => import(pathToFileURL(filePath).href),
});

const migrations = await provider.getMigrations();
const sortedNames = Object.keys(migrations).sort();

const statements: string[] = [];
const db = createDumpDb(statements);

for (const name of sortedNames) {
  await migrations[name].up(db);
}

await db.destroy();

const header = [
  "-- 由 `pnpm db:sql` 生成，请勿手改；修改 migrations 后重新执行该命令。",
  `-- 迁移顺序: ${sortedNames.join(", ")}`,
  "",
].join("\n");

process.stdout.write(`${header}${statements.join("\n\n")}\n`);

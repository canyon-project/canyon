import { SqliteDB } from './sqlite.interface';
import { NodeSqliteAdapter } from './adapters/node-sqlite.adapter';
import { BetterSqliteAdapter } from './adapters/better-sqlite.adapter';

export function createSqliteDB(filename: string): SqliteDB {
  const major = Number(process.versions.node.split('.')[0]);

  if (major >= 22) {
    console.log(`🔧 SQLite Factory: Using Node.js built-in SQLite driver (Node.js ${process.versions.node})`);
    return new NodeSqliteAdapter(filename);
  }

  console.log(`🔧 SQLite Factory: Using better-sqlite3 driver (Node.js ${process.versions.node})`);
  return new BetterSqliteAdapter(filename);
}

import { SqliteDB } from './sqlite.interface';
import { NodeSqliteAdapter } from './adapters/node-sqlite.adapter';
import { BetterSqliteAdapter } from './adapters/better-sqlite.adapter';

export function createSqliteDB(filename: string): SqliteDB {
  const major = Number(process.versions.node.split('.')[0]);

  if (major >= 22) {
    return new NodeSqliteAdapter(filename);
  }

  return new BetterSqliteAdapter(filename);
}

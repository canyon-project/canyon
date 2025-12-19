// adapters/node-sqlite.adapter.ts
import { Database as NodeSqlite } from 'node:sqlite';
import { SqliteDB } from '../sqlite.interface';

export class NodeSqliteAdapter implements SqliteDB {
  private db: NodeSqlite;

  constructor(filename: string) {
    this.db = new NodeSqlite(filename);
  }

  async query<T>(sql: string, params: unknown[] = []) {
    return this.db.prepare(sql).all(params) as T[];
  }

  async execute(sql: string, params: unknown[] = []) {
    this.db.prepare(sql).run(params);
  }

  async transaction<T>(fn: (db: SqliteDB) => Promise<T>) {
    this.db.exec('BEGIN');
    try {
      const result = await fn(this);
      this.db.exec('COMMIT');
      return result;
    } catch (e) {
      this.db.exec('ROLLBACK');
      throw e;
    }
  }

  async close() {
    this.db.close();
  }
}

// adapters/node-sqlite.adapter.ts
import { DatabaseSync, SQLInputValue } from 'node:sqlite';
import { SqliteDB } from '../sqlite.interface';

export class NodeSqliteAdapter implements SqliteDB {
  private db: DatabaseSync;

  constructor(filename: string) {
    this.db = new DatabaseSync(filename);
  }

  async query<T>(sql: string, params: SQLInputValue[] = []) {
    const stmt = this.db.prepare(sql);
    return stmt.all(...params) as T[];
  }

  async execute(sql: string, params: SQLInputValue[] = []) {
    const stmt = this.db.prepare(sql);
    stmt.run(...params);
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

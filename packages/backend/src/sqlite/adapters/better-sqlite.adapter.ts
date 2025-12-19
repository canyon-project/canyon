// adapters/better-sqlite.adapter.ts
import BetterSqlite3 from 'better-sqlite3';
import { SqliteDB } from '../sqlite.interface';

export class BetterSqliteAdapter implements SqliteDB {
  private db: BetterSqlite3.Database;

  constructor(filename: string) {
    this.db = new BetterSqlite3(filename);
  }

  async query<T>(sql: string, params: unknown[] = []) {
    return this.db.prepare(sql).all(params) as T[];
  }

  async execute(sql: string, params: unknown[] = []) {
    this.db.prepare(sql).run(params);
  }

  async transaction<T>(fn: (db: SqliteDB) => Promise<T>) {
    const trx = this.db.transaction(() => fn(this));
    return trx();
  }

  async close() {
    this.db.close();
  }
}

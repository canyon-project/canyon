import BetterSqlite3 from 'better-sqlite3';
import type { SqliteDB, SqliteExecuteResult } from '../sqlite.interface';

export class BetterSqliteAdapter implements SqliteDB {
  private db: BetterSqlite3.Database;

  constructor(filename: string) {
    this.db = new BetterSqlite3(filename);
    console.log(`📁 Better SQLite Adapter: Connected to ${filename}`);
  }

  async query<T = Record<string, unknown>>(
    sql: string,
    params?: unknown[],
  ): Promise<T[]> {
    try {
      return this.db.prepare(sql).all(params || []) as T[];
    } catch (error) {
      console.error(`❌ Query failed: ${sql}`, error);
      throw error;
    }
  }

  async execute(sql: string, params?: unknown[]): Promise<SqliteExecuteResult> {
    try {
      const result = this.db.prepare(sql).run(params || []);

      return {
        changes: result.changes,
        lastInsertRowid: typeof result.lastInsertRowid ==='bigint'?0:result.lastInsertRowid,
      };
    } catch (error) {
      console.error(`❌ Execute failed: ${sql}`, error);
      throw error;
    }
  }

  async close(): Promise<void> {
    this.db.close();
    console.log('🔒 Better SQLite Adapter: Database closed');
  }
}

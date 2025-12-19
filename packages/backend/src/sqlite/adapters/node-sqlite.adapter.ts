import { DatabaseSync } from 'node:sqlite';
import type { SqliteDB, SqliteExecuteResult } from '../sqlite.interface';

export class NodeSqliteAdapter implements SqliteDB {
  private db: DatabaseSync;

  constructor(filename: string) {
    this.db = new DatabaseSync(filename);
    console.log(`📁 Node SQLite Adapter: Connected to ${filename}`);
  }

  async query<T = Record<string, unknown>>(
    sql: string,
    params?: unknown[],
  ): Promise<T[]> {
    try {
      const stmt = this.db.prepare(sql);
      if (params && params.length > 0) {
        // biome-ignore lint/suspicious/noExplicitAny: SQLite params need to be spread as any
        return stmt.all(...(params as any[])) as T[];
      }
      return stmt.all() as T[];
    } catch (error) {
      console.error(`❌ Query failed: ${sql}`, error);
      throw error;
    }
  }

  async execute(sql: string, params?: unknown[]): Promise<SqliteExecuteResult> {
    try {
      const stmt = this.db.prepare(sql);
      const result =
        params && params.length > 0
          ? // biome-ignore lint/suspicious/noExplicitAny: SQLite params need to be spread as any
            stmt.run(...(params as any[]))
          : stmt.run();

      return {
        changes: Number(result.changes) || 0,
        lastInsertRowid: result.lastInsertRowid
          ? Number(result.lastInsertRowid)
          : undefined,
      };
    } catch (error) {
      console.error(`❌ Execute failed: ${sql}`, error);
      throw error;
    }
  }

  async close(): Promise<void> {
    this.db.close();
    console.log('🔒 Node SQLite Adapter: Database closed');
  }
}

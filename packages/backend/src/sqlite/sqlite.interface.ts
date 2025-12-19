export interface SqliteDB {
  query<T = any>(sql: string, params?: unknown[]): Promise<T[]>;
  execute(sql: string, params?: unknown[]): Promise<void>;
  transaction<T>(fn: (db: SqliteDB) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

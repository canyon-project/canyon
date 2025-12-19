export interface SqliteExecuteResult {
  changes: number;
  lastInsertRowid?: number;
}

export interface SqliteDB {
  query<T = any>(sql: string, params?: unknown[]): Promise<T[]>;
  execute(sql: string, params?: unknown[]): Promise<SqliteExecuteResult>;
  close(): Promise<void>;
}

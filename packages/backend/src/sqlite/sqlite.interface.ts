export interface SqliteExecuteResult {
  changes: number;
  lastInsertRowid?: number|bigint;
}

export interface SqliteDB {
  query<T = Record<string, unknown>>(
    sql: string,
    params?: unknown[],
  ): Promise<T[]>;
  execute(sql: string, params?: unknown[]): Promise<SqliteExecuteResult>;
  close(): Promise<void>;
}

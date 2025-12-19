import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { SqliteDB } from './sqlite.interface';
import { createSqliteDB } from './sqlite.factory';

@Injectable()
export class SqliteService implements OnModuleDestroy {
  private readonly db: SqliteDB;

  constructor() {
    this.db = createSqliteDB(process.env.SQLITE_PATH ?? 'data.db');
  }

  get connection(): SqliteDB {
    return this.db;
  }

  async onModuleDestroy() {
    await this.db.close();
  }
}

import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { createSqliteDB } from './sqlite.factory';
import { SqliteDB } from './sqlite.interface';

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

import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from 'generated/schema-sqlite/client';

@Injectable()
export class PrismaSqliteService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      // log: ['query', 'info', 'warn', 'error'],
    });
  }
  async onModuleInit() {
    // 👇 启动时执行简表 SQL
    await this.initTables();
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
  private async initTables() {
    // 队列表：payload 存储为 JSON string
    await this.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS coverage_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        payload TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'PENDING'
          CHECK (status IN ('PENDING', 'PROCESSING', 'FAILED')),
        pid INTEGER,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }
}

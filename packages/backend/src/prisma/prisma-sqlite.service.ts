import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient } from '../../generated/schema-sqlite/client';

@Injectable()
export class PrismaService2
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const adapter = new PrismaLibSql({
      url: 'file:local.db',
    });
    super({ adapter });
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
    // 示例：健康检查 / 兜底表
    await this.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS coverage_queue (
                                                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                  payload TEXT NOT NULL,
                                                  status TEXT NOT NULL DEFAULT 'PENDING'
                                                  CHECK (status IN ('PENDING', 'PROCESSING', 'DONE', 'FAILED')),
        retry INTEGER NOT NULL DEFAULT 0,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    `);
  }
}

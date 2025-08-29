import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { createClient, ClickHouseClient } from '@clickhouse/client'

@Injectable()
export class ChService implements OnModuleInit, OnModuleDestroy {
  private client!: ClickHouseClient
  onModuleInit(): void {
    this.client = createClient({
      url: process.env.CLICKHOUSE_HOST ?? 'http://localhost:8123',
      database: process.env.CLICKHOUSE_DATABASE ?? 'default',
      username: process.env.CLICKHOUSE_USER ?? 'default',
      password: process.env.CLICKHOUSE_PASSWORD ?? 'password',
    })
  }

  onModuleDestroy(): void {
    void this.client.close()
  }

  getClient(): ClickHouseClient {
    return this.client
  }
}

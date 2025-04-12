import { Module, Global } from '@nestjs/common';
import { createClient } from '@clickhouse/client';
import * as process from 'node:process';

@Global()
@Module({
  providers: [
    {
      provide: 'CLICKHOUSE_CLIENT',
      useFactory: () => {
        return createClient({
          url: process.env.CLICKHOUSE_URL,
          username: process.env.CLICKHOUSE_USERNAME,
          password: process.env.CLICKHOUSE_PASSWORD,
          database: process.env.CLICKHOUSE_DATABASE,
        });
      },
    },
  ],
  exports: ['CLICKHOUSE_CLIENT'],
})
export class ClickHouseModule {}

import { Module, Global } from '@nestjs/common';
import { createClient } from '@clickhouse/client';

@Global()
@Module({
  providers: [
    {
      provide: 'CLICKHOUSE_CLIENT',
      useFactory: () => {
        return createClient({
          url: 'http://localhost:8123',
          username: 'default',
          password: '123456',
          database: 'default',
        });
      },
    },
  ],
  exports: ['CLICKHOUSE_CLIENT'],
})
export class ClickHouseModule {}

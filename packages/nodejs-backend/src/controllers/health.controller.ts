import { Controller, Get, Optional } from '@nestjs/common';
import type { MikroORM as MikroOrmType } from '@mikro-orm/core';
import { ChService } from '../modules/ch/ch.service';

@Controller('health')
export class HealthController {
  constructor(@Optional() private readonly orm?: MikroOrmType, private readonly ch?: ChService) {}

  @Get()
  async ok() {
    const response: Record<string, any> = {
      status: 'ok',
      message: '服务运行正常',
      service: 'backend-nodejs'
    };

    // Postgres
    try {
      if (this.orm) {
        await this.orm.em.getConnection().execute('select 1');
        response.postgres = 'connected';
      } else {
        response.postgres = 'disabled';
      }
    } catch (err: any) {
      response.status = 'error';
      response.postgres = 'disconnected';
      response.postgres_error = String(err?.message ?? err);
    }

    // ClickHouse
    try {
      if (this.ch) {
        await this.ch.getClient().ping();
        response.clickhouse = 'connected';
      }
    } catch (err: any) {
      response.clickhouse = 'disconnected';
      response.clickhouse_error = String(err?.message ?? err);
    }

    return response;
  }
}



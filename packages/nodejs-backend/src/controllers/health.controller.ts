import { Controller, Get, Optional } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';
import { ChService } from '../modules/ch/ch.service';

@Controller('vi/health')
export class HealthController {
  constructor(
    private readonly chService: ChService,
    @Optional() private readonly orm?: MikroORM
  ) {}

  @Get()
  async ok() {
    const out: Record<string, any> = { status: 'ok', timestamp: new Date().toISOString(), services: {} };

    // Postgres health (lightweight)
    try {
      const pgRes = await this.orm?.em.getConnection().execute('SELECT 1');
      out.services = { ...out.services, postgres: { ok: true, result: pgRes } };
    } catch (e: any) {
      out.services = { ...out.services, postgres: { ok: false, error: String(e?.message || e) } };
    }

    // ClickHouse health
    try {
      const ck = await this.chService.getClient().ping();
      out.services = { ...out.services, clickhouse: { ok: true, result: ck } };
    } catch (e: any) {
      out.services = { ...out.services, clickhouse: { ok: false, error: String(e?.message || e) } };
    }

    return out;
  }
}



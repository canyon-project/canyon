import type { MikroORM } from '@mikro-orm/core';
import { Injectable, Optional } from '@nestjs/common';

@Injectable()
export class SystemConfigService {
  constructor(@Optional() private readonly orm?: MikroORM) {}

  async get(key: string): Promise<string | undefined> {
    if (!this.orm) return undefined;
    const knex = this.orm.em.getConnection();
    const rows = await knex.execute(
      'SELECT value FROM canyonjs_config WHERE key = ? LIMIT 1',
      [key],
    );
    return rows?.[0]?.value as string | undefined;
  }
}

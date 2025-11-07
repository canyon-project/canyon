import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InfraConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async listAll() {
    const rows = await this.prisma.infraConfig.findMany();
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      value: r.value,
      isEncrypted: r.isEncrypted,
      createdOn: r.createdOn,
      updatedOn: r.updatedOn,
    }));
  }

  async upsertMany(
    items: Array<{ name: string; value: string; isEncrypted?: boolean }>,
  ) {
    for (const it of items) {
      await this.prisma.infraConfig.upsert({
        where: { name: it.name },
        create: {
          name: it.name,
          value: it.value,
          isEncrypted: Boolean(it.isEncrypted),
          lastSyncedEnvFileValue: '',
        },
        update: {
          value: it.value,
          isEncrypted: Boolean(it.isEncrypted),
        },
      });
    }
    return { ok: true };
  }
}

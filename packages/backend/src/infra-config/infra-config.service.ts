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
}

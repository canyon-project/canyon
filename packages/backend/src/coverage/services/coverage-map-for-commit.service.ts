import { Injectable } from '@nestjs/common';
import { logger } from '../../logger';
import { PrismaService } from '../../prisma/prisma.service';
import { PrismaSqliteService } from '../../prisma/prisma-sqlite.service';

@Injectable()
export class CoverageMapForCommitService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaSqlite: PrismaSqliteService,
  ) {}
  async invoke(data) {
    logger({
      type: 'info',
      title: 'test log',
      message: 'test log',
      addInfo: data,
    });
    const r2 = await this.prismaSqlite.coverageQueue.create({
      data: {
        payload: {},
        status: 'PENDING',
        retry: 1,
        createdAt: new Date(),
        // status    QueueStatus @default(PENDING)
        // retry     Int         @default(0)
      },
    });

    const r3 = await this.prismaSqlite.coverageQueue.findMany({
      where: {},
    });
    return {
      r2,
      r3,
    };
  }
}

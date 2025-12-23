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
  async invoke() {
    logger({
      type: 'info',
      title: 'test log',
      message: 'test log',
      addInfo: {
        sha: 'coverageClientDto.sha',
        buildID: 'coverageClientDto.buildID',
      },
    });
    const r1 = await this.prisma.repo.findMany({
      where: {},
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
      r1,
      r2,
      r3,
    };
  }
}

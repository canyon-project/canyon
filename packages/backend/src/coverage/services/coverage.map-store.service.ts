import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CoverageMapStoreService {
  constructor(private readonly prisma: PrismaService) {}

  async fetchCoverageMapsFromClickHouse(hashList: string[]) {
    const coverMapList = await this.prisma.coverMap.findMany({
      where: {
        hash: {
          in: hashList,
        },
      },
    });
    return coverMapList;
  }
}

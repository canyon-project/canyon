// import { InjectRepository } from '@mikro-orm/nestjs';
// import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
// import { CoverMapEntity } from '../../../entities/cover-map.entity';

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

import { Injectable } from '@nestjs/common';
import { decodeCompressedObject } from '../../collect/helpers/transform';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CoverageMapStoreService {
  constructor(private readonly prisma: PrismaService) {}

  async fetchCoverageMapsFromClickHouse(hashList: string[]) {
    const coverMapList = await this.prisma.coverageMap
      .findMany({
        where: {
          hash: {
            in: hashList,
          },
        },
      })
      .then((res) => {
        return res.map((i) => {
          return {
            origin: decodeCompressedObject(i.origin),
            restore: decodeCompressedObject(i.restore),
            hash: i.hash,
          };
        });
      });
    return coverMapList;
  }
}

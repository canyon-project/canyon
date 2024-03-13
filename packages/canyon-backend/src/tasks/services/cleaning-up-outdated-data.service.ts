import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { deleteSpecificCoverageData } from '../../adapter/coverage-data.adapter';

@Injectable()
export class CleaningUpOutdatedDataService {
  constructor(private readonly prisma: PrismaService) {}
  // 每过一天清理一下coverage集合，删除超过3天的normal数据
  @Cron('30 2 * * *') // 每天凌晨2点半执行
  async cleaningUpOutdatedData() {
    const conditions = {
      where: {
        covType: 'normal',
        createdAt: {
          lt: new Date(new Date().valueOf() - 2 * 24 * 60 * 60 * 1000),
        },
      },
    };

    const willDelCoverages = await this.prisma.coverage.findMany(conditions);

    const coverageDeleteManyRes =
      await this.prisma.coverage.deleteMany(conditions);

    const ids = willDelCoverages.map(({ relationID }) => relationID);

    for (let i = 0; i < ids.length; i++) {
      await deleteSpecificCoverageData(ids[i]);
    }
  }
}

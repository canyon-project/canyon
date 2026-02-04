import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/*

覆盖率数据上报的时候用上游的变量

*/

@Injectable()
export class CoverageMapForCrService {
  constructor(private readonly prisma: PrismaService) {}

  async invoke(p) {
    const crList = await this.prisma.cr.findMany({
      where: {
        id: `${p.provider}${p.repoID}`,
      },
    });
    const len = crList.length;
    if (!(len > 0)) {
      return {
        msg: '没找到',
      };
    }

    const cr = crList[0];

    return cr;
  }
}

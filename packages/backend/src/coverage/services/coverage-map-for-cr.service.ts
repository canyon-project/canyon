import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/*

覆盖率数据上报的时候用上游的变量
接下来就是查cr表，根据仓库查到fork的上游repoID，然后查coverage表，查diff表，服用commit接口
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

    // p.crID

    const r = await this.prisma.diff.findMany({
      where:{
        subject:'pr',
        subject_id:'1'
      }
    })

    return {
      r,
      cr
    };
  }
}

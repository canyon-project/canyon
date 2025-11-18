import { Body, Controller, Get, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
// import { Public } from 'src/auth/public.decorator';
import { CoverageClientDto } from './dto/coverage-client.dto';
import { formatCoverageData } from './helpers/formatCoverageData';
// import {de} from "canyon-map";
import { decodeCompressedObject } from './helpers/transform';
import { CoverageClientService } from './services/coverage-client.service';

// @Public()
@Controller('')
export class CollectController {
  constructor(
    private coverageClientService: CoverageClientService,
    private prisma: PrismaService,
  ) {
    // this.prisma.project.findMany()
    // this.prisma.repo.findFirst({
    //   where:{}
    // }).then(r=>{
    //   console.log(r,'rrr')
    // })
  }
  @Post('coverage/client')
  async uploadCoverageFromClient(@Body() coverageClientDto: CoverageClientDto) {
    return this.coverageClientService.invoke('1', {
      // @ts-expect-errorr
      reportID: coverageClientDto.reportID || coverageClientDto.sha,
      // @ts-expect-errorr
      reportProvider: coverageClientDto.reportProvider || 'person',
      ...coverageClientDto,
      coverage: formatCoverageData(coverageClientDto.coverage),
      buildTarget: coverageClientDto.buildTarget || '',
    });
  }

  @Get('test123')
  async ter() {
    const ssss = await this.prisma.coverageMapRelation.findFirst({
      where: {
        // id:'8e490cec8d0c008b241fd313652ae0773b669ae1|src/pages/sharedFavoriteList/hooks/useTrace.ts', 没有，调查原因
        // id:'8e490cec8d0c008b241fd313652ae0773b669ae1|src/pages/platform/components/SelectBox/RankingTypeTabsV2/const.ts' 有
      },
    });

    const s = await this.prisma.coverMap.findFirst({
      where: {
        hash: {
          contains: ssss?.coverageMapHashID || '',
        },
      },
    });

    // ssss.coverageMapHashID

    const sx = await this.prisma.coverageSourceMap
      .findFirst({
        where: {
          hash: ssss?.sourceMapHashID || '',
        },
      })
      .then((r) => {
        return decodeCompressedObject(r?.sourceMap);
      });

    return {
      sx,
      s,
    };
  }
}

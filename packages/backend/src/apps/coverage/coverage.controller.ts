import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { CoverageClientDto } from './dto/coverage-client.dto';
import { CoverageClientService } from './services/coverage-client.service';
import { CoverageFinalService } from './services/core/coverage-final.service';
import {
  genSummaryMapByCoverageMap,
  getSummaryByPath,
  mergeCoverageMap,
} from 'canyon-data';
@Controller('')
export class CoverageController {
  constructor(
    private coverageClientService: CoverageClientService,
    private coverageFinalService: CoverageFinalService,
  ) {}
  @Post('coverage/client')
  async uploadCoverageFromClient(@Body() coverageClientDto: CoverageClientDto) {
    // TODO: 实现覆盖率数据处理逻辑
    return this.coverageClientService.invoke('1', coverageClientDto);
  }

  //   /projects/gitlab/canyon-projects/coverage?sha=1234567890abcdef

  // /api/coverage/summary/v2/map

  @Get('api/coverage/summary/map')
  async coverageSummaryMap(@Query() query) {
    return this.coverageFinalService
      .invoke(
        query.provider,
        query.repoID,
        query.sha,
        query.buildProvider,
        query.buildID,
      )
      .then((r) => genSummaryMapByCoverageMap(r));
  }

  @Get('api/coverage/map')
  async coverageMap(@Query() query) {
    return this.coverageFinalService.invoke(
      query.provider,
      query.repoID,
      query.sha,
      query.buildProvider,
      query.buildID,
    );
  }
}

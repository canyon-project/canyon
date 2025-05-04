import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { CoverageClientDto } from './dto/coverage-client.dto';
import { CoverageClientService } from './services/coverage-client.service';
import { CoverageFinalService } from './services/core/coverage-final.service';
import { genSummaryMapByCoverageMap } from 'canyon-data';
import { CoverageQueryDto } from './dto/coverage-query.dto'; // 假设 DTO 文件路径

@Controller('')
export class CoverageController {
  constructor(
    private coverageClientService: CoverageClientService,
    private coverageFinalService: CoverageFinalService,
  ) {}
  @Post('coverage/client')
  async uploadCoverageFromClient(@Body() coverageClientDto: CoverageClientDto) {
    return this.coverageClientService.invoke('1', coverageClientDto);
  }

  @Get('api/coverage/summary/map')
  async coverageSummaryMap(@Query() query: CoverageQueryDto) {
    const {
      provider,
      repoID,
      sha,
      buildProvider,
      buildID,
      reportProvider,
      reportID,
      filePath,
    } = query;
    return this.coverageFinalService
      .invoke(
        provider,
        repoID,
        sha,
        buildProvider,
        buildID,
        reportProvider,
        reportID,
        filePath,
      )
      .then((r) => {
        return {
          performance: r.performance,
          data: genSummaryMapByCoverageMap(r.data),
        };
      });
  }

  @Get('api/coverage/map')
  async coverageMap(@Query() query: CoverageQueryDto) {
    const {
      provider,
      repoID,
      sha,
      buildProvider,
      buildID,
      reportProvider,
      reportID,
      filePath,
    } = query;
    return this.coverageFinalService.invoke(
      provider,
      repoID,
      sha,
      buildProvider,
      buildID,
      reportProvider,
      reportID,
      filePath,
    );
  }
}

import { Controller, Get, Query } from '@nestjs/common';
import { CoverageFinalService } from './services/core/coverage-final.service';
import { genSummaryMapByCoverageMap } from 'canyon-data';
import { CoverageQueryDto } from './dto/coverage-query.dto'; // 假设 DTO 文件路径

@Controller('')
export class CoverageController {
  constructor(
    private coverageFinalService: CoverageFinalService,
  ) {}

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
        return genSummaryMapByCoverageMap(r);
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

import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { CoverageClientService } from './services/coverage-client.service';
import { CoverageClientDto } from './dto/coverage-client.dto';
import { CoverageMapDto } from './dto/coverage-map.dto';
import { CoverageMapData } from 'istanbul-lib-coverage';
import { CoveragePreStoreService } from './services/coverage-pre-store.service';
import { CoverageSummaryDto } from './dto/coverage-summary.dto';
import { CoverageSummaryDataMap } from 'canyon-data';

@Controller('')
export class CoverageController {
  constructor(
    private coverageClientService: CoverageClientService,
    private readonly coveragePreStoreService: CoveragePreStoreService,
  ) {}
  @Post('coverage/client')
  async uploadCoverageFromClient(@Body() coverageClientDto: CoverageClientDto) {
    return this.coverageClientService.invoke('1', coverageClientDto);
  }

  // 下面那个要删掉的
  @Get('api/coverage/summary/map')
  async coverageSummary(
    @Query() coverageSummaryDto: CoverageSummaryDto,
  ): Promise<CoverageSummaryDataMap> {
    const { repoID, sha, reportID } = coverageSummaryDto;

    return this.coveragePreStoreService.coverageSummaryMap({
      repoID,
      sha,
      reportID,
    });
  }

  @Get('api/coverage/map')
  async coverageMap(
    @Query() coverageMapDto: CoverageMapDto,
  ): Promise<CoverageMapData> {
    const { repoID, sha, reportID, filepath } = coverageMapDto;
    return this.coveragePreStoreService.coverageMap({
      repoID,
      sha,
      reportID,
      filepath,
    });
  }
}

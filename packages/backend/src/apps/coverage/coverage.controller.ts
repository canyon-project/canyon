import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { CoverageClientDto } from './dto/coverage-client.dto';
import { CoverageClientService } from './services/coverage-client.service';
import {CoverageSummaryDataMap} from "canyon-data";
import { CoverageMapData } from "istanbul-lib-coverage";
import { CoverageSummaryDto } from './dto/coverage-summary.dto';
import {CoverageMapDto} from "./dto/coverage-map.dto";
import {CoveragePreStoreService} from "./services/coverage-pre-store.service";

@Controller('')
export class CoverageController {
  constructor(private coverageClientService: CoverageClientService,

              private readonly coveragePreStoreService: CoveragePreStoreService,
              ) {}
  @Post('coverage/client')
  async uploadCoverageFromClient(@Body() coverageClientDto: CoverageClientDto) {
    // TODO: 实现覆盖率数据处理逻辑
    return this.coverageClientService.invoke('1', coverageClientDto);
  }



  // 下面那个要删掉的
  @Get("api/coverage/summary/map")
  async coverageSummary(
    @Query() coverageSummaryDto: CoverageSummaryDto,
  ): Promise<CoverageSummaryDataMap> {
    const { projectID, sha, reportID } = coverageSummaryDto;
    return this.coveragePreStoreService.coverageSummaryMap({
      projectID,
      sha,
      reportID,
    });
  }


  @Get("api/coverage/map")
  async coverageMap(
    @Query() coverageMapDto: CoverageMapDto,
  ): Promise<CoverageMapData> {
    const { projectID, sha, reportID, filepath } = coverageMapDto;
    return this.coveragePreStoreService.coverageMap({
      projectID,
      sha,
      reportID,
      filepath,
    });
  }
}

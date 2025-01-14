import { Controller, Get, Query } from "@nestjs/common";
import { CoveragePreStoreService } from "./services/coverage-pre-store.service";
import { CoverageSummaryDto } from "./dto/coverage-summary.dto";
import { CoverageSummaryDataMap } from "canyon-data";
import { CoverageMapData } from "istanbul-lib-coverage";
import { CoverageMapDto } from "./dto/coverage-map.dto";
import { CoverageDataComputeService } from "./services/coverage-data-compute.service";
import { CoverageService } from "./services/coverage.service";
import { CoverageReportsService } from "./services/coverage-reports.service";

@Controller()
export class CoverageController {
  constructor(
    private readonly coveragePreStoreService: CoveragePreStoreService,
    private readonly coverageDataComputeService: CoverageDataComputeService,
    private readonly coverageService: CoverageService,
    private readonly coverageReportsService: CoverageReportsService,
  ) {}

  // TODO 马上要废弃的接口
  @Get("api/coverage/summary/map")
  async oldCoverageSummary(@Query() coverageSummaryDto: any): Promise<any> {
    const { projectID, sha, reportID } = coverageSummaryDto;

    return this.coverageService.coverageSummaryMap(projectID, sha, reportID);
  }

  @Get("api/coverage/summary/v2/map")
  async coverageSummary(
    @Query() coverageSummaryDto: CoverageSummaryDto,
  ): Promise<CoverageSummaryDataMap> {
    const { projectID, sha, reportID } = coverageSummaryDto;

    if (reportID && reportID.includes(",")) {
      return this.coverageDataComputeService.coverageSummaryMap({
        projectID,
        sha,
        reportID,
      });
    }

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
    if (reportID && reportID.includes(",")) {
      return this.coverageDataComputeService.coverageMap({
        projectID,
        sha,
        reportID,
        filepath,
      });
    }
    return this.coveragePreStoreService.coverageMap({
      projectID,
      sha,
      reportID,
      filepath,
    });
  }

  @Get("api/coverage/reports")
  async coverageReports(@Query() query): Promise<any> {
    const { bu, start, end } = query;
    return this.coverageReportsService.invoke({ bu, start, end });
  }
}

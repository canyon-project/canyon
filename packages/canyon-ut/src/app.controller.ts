import {Controller, Get, Query} from "@nestjs/common";
import {CoverageMapService} from "./services/coverage-map.service";
import {CoverageSummaryMapService} from "./services/coverage-summary-map.service";
// import { PrismaService } from "./prisma/prisma.service";
// import { convertSystemSettingsFromTheDatabase } from "./utils/sys";

@Controller()
export class AppController {
  constructor(
    private readonly coverageMapService: CoverageMapService,
    private readonly coverageSummaryMapService: CoverageSummaryMapService
  ) {}
  @Get("vi/health")
  async viHealth2() {
    return "230614";
  }
  @Get("api/coverage/map")
  async coverageMap() {
    return this.coverageMapService.invoke({
      projectID: "1",
      sha: "1",
      reportID: "1",
      // filepath: "
    });
  }
  @Get("api/coverage/summary/map")
  async coverageSummaryMap(@Query() coverageSummaryDto: any) {
    const { projectID, sha, reportID } = coverageSummaryDto;
    return this.coverageSummaryMapService.invoke({      projectID,
      sha,
      // reportID,
      }
    );
  }
}

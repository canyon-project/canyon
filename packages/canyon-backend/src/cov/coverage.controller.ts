import { Controller, Get, Query } from "@nestjs/common";
import { CoverageService } from "./services/coverage.service";
import { CoverageSummaryDto } from "./dto/coverage-summary.dto";
import { CoverageSummaryDataMap } from "canyon-data";
import { CoverageMapData } from "istanbul-lib-coverage";
import { CoverageMapDto } from "./dto/coverage-map.dto";

@Controller()
export class CoverageController {
    constructor(private readonly coverageService: CoverageService) {}
    @Get("api/coverage/summary/map")
    async coverageSummary(
        @Query() coverageSummaryDto: CoverageSummaryDto,
    ): Promise<CoverageSummaryDataMap> {
        const { projectID, sha, reportID } = coverageSummaryDto;
        return this.coverageService.coverageSummaryMap({
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
        return this.coverageService.coverageMap({
            projectID,
            sha,
            reportID,
            filepath,
        });
    }
}

import { Controller, Get, Query } from "@nestjs/common";
import { CoveragePreStoreService } from "./services/coverage-pre-store.service";
import { CoverageSummaryDto } from "./dto/coverage-summary.dto";
import { CoverageSummaryDataMap } from "canyon-data";
import { CoverageMapData } from "istanbul-lib-coverage";
import { CoverageMapDto } from "./dto/coverage-map.dto";
import { CoverageDataComputeService } from "./services/coverage-data-compute.service";

@Controller()
export class CoverageController {
    constructor(
        private readonly coveragePreStoreService: CoveragePreStoreService,
        private readonly coverageDataComputeService: CoverageDataComputeService,
    ) {}
    @Get("api/coverage/summary/map")
    async coverageSummary(
        @Query() coverageSummaryDto: CoverageSummaryDto,
    ): Promise<CoverageSummaryDataMap> {
        const { projectID, sha, reportID } = coverageSummaryDto;

        if (reportID.includes(",")) {
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
}

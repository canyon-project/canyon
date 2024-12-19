import { Controller, Get, Query } from "@nestjs/common";
import { CoverageService } from "./services/coverage.service";

@Controller()
export class CoverageController {
    constructor(private readonly coverageService: CoverageService) {}
    @Get("api/coverage/summary/map")
    async coverageSummary(@Query() query): Promise<any> {
        const { projectID, sha, reportID } = query;
        return this.coverageService.getCoverageSummaryMap(
            projectID,
            sha,
            reportID,
        );
    }

    @Get("api/coverage/map")
    async coverageMap(@Query() query): Promise<any> {
        const { projectID, sha, reportID, filepath } = query;
        return this.coverageService.getCoverageData(
            projectID,
            sha,
            reportID,
            filepath,
        );
    }
}

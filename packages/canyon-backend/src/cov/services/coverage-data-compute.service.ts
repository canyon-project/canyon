// 覆盖率实体数据计算，适用于reportID数组计算

import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import {
    CoverageSummaryDataMap,
    genSummaryMapByCoverageMap,
} from "canyon-data";
import { CoverageSummaryDto } from "../dto/coverage-summary.dto";
import { CoverageMapDto } from "../dto/coverage-map.dto";
import { CoverageMapData } from "istanbul-lib-coverage";
import { TestExcludeService } from "./common/test-exclude.service";
import { CoverageFinalService } from "./common/coverage-final.service";

/**
 * Service to handle pre-storage operations for code coverage data.
 * This service provides methods for retrieving and processing coverage summary and coverage map data.
 *
 * It interacts with the Prisma service to fetch coverage-related data from the database, decompresses the
 * data, processes it, and formats it before returning the results.
 *
 * Methods:
 * - coverageSummaryMap: Retrieves and decompresses the coverage summary for a specific project and report.
 * - coverageMap: Retrieves, processes, and reorganizes coverage map data for a specific project and report.
 *
 * Dependencies:
 * - PrismaService: Provides access to the database to retrieve coverage and coverage map data.
 * - canyon-data: Utilities for resetting, reorganizing, and manipulating coverage data.
 * - canyon-map: Utility to remap coverage data based on the instrumented current working directory.
 */
@Injectable()
export class CoverageDataComputeService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly testExcludeService: TestExcludeService,
        private readonly coverageFinalService: CoverageFinalService,
    ) {}

    /**
     * Retrieves the coverage summary map for a specific project, commit (SHA), and report ID.
     *
     * @param {CoverageSummaryDto} dto - The data transfer object containing project ID, SHA, and report ID.
     * @returns {Promise<CoverageSummaryDataMap>} - A promise that resolves to the decompressed coverage summary map.
     * @throws {HttpException} - If the coverage summary data is not found, an exception with status 404 is thrown.
     */
    async coverageSummaryMap({
        projectID,
        sha,
        reportID,
    }: CoverageSummaryDto): Promise<CoverageSummaryDataMap> {
        // 直接调用同class下的coverageMap方法
        const coverage = await this.coverageMap({
            projectID,
            sha,
            reportID,
            filepath: undefined,
        });
        const codechanges = await this.prisma.codechange.findMany({
            where: {
                projectID,
                sha,
            },
        });
        return genSummaryMapByCoverageMap(
            await this.testExcludeService.invoke(projectID, coverage),
            codechanges,
        );
    }

    /**
     * Retrieves and processes the coverage map data for a specific project, commit (SHA), report ID, and file path.
     *
     * @param {CoverageMapDto} dto - The data transfer object containing project ID, SHA, report ID, and file path.
     * @returns {Promise<CoverageMapData>} - A promise that resolves to the processed and reorganized coverage map data.
     */
    async coverageMap({
        projectID,
        sha,
        reportID,
        filepath,
    }: CoverageMapDto): Promise<CoverageMapData> {
        return this.coverageFinalService.invoke({
            projectID,
            sha,
            reportID,
            filepath,
        });
    }
}

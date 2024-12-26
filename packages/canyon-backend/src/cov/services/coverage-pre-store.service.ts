import { HttpException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CoverageSummaryDataMap } from "canyon-data";
import { decompressedData } from "../../utils/zstd";

import { CoverageSummaryDto } from "../dto/coverage-summary.dto";
import { CoverageMapDto } from "../dto/coverage-map.dto";
import { CoverageMapData } from "istanbul-lib-coverage";
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
export class CoveragePreStoreService {
    constructor(
        private readonly prisma: PrismaService,
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
        const coverage = await this.prisma.coverage.findFirst({
            where: {
                sha,
                projectID,
                reportID: reportID,
                covType: reportID ? "agg" : "all",
            },
        });

        if (coverage?.summary) {
            return decompressedData<CoverageSummaryDataMap>(coverage.summary);
        }
        // 不报错，直接返回空对象
        return {};
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

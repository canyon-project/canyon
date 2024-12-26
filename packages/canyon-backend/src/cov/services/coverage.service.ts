import { HttpException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import {
    resetCoverageDataMap,
    reorganizeCompleteCoverageObjects,
    CoverageSummaryDataMap,
} from "canyon-data";
import { removeNullKeys } from "../../utils/utils";
import { decompressedData } from "../../utils/zstd";
import { convertDataFromCoverageMapDatabase } from "../../utils/coverage";
import { remapCoverageWithInstrumentCwd } from "canyon-map";
import { CoverageSummaryDto } from "../dto/coverage-summary.dto";
import { CoverageMapDto } from "../dto/coverage-map.dto";

@Injectable()
export class CoverageService {
    constructor(private readonly prisma: PrismaService) {}

    async coverageSummaryMap({ projectID, sha, reportID }: CoverageSummaryDto) {
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
        throw new HttpException(
            {
                statusCode: 404,
                message: "summary data not found",
                errorCode: "SUMMARY_DATA_NOT_FOUND",
            },
            404,
        );
    }

    async coverageMap({ projectID, sha, reportID, filepath }: CoverageMapDto) {
        const coverage = await this.prisma.coverage.findFirst({
            where: {
                sha,
                projectID,
                reportID: reportID,
                covType: reportID ? "agg" : "all",
            },
        });
        // 原始hit数据
        const hit = await decompressedData(coverage.hit);
        const coverageMaps = await this.prisma.coverageMap.findMany({
            where: removeNullKeys({
                sha,
                projectID,
                path: filepath,
            }),
        });

        const { map, instrumentCwd } =
            await convertDataFromCoverageMapDatabase(coverageMaps);

        const reMapMap = await remapCoverageWithInstrumentCwd(
            resetCoverageDataMap(map),
            instrumentCwd,
        );

        const newCoverage = reorganizeCompleteCoverageObjects(
            reMapMap, //
            // @ts-ignore
            hit,
        );

        return newCoverage;
    }
}

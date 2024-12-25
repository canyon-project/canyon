import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CoverageSummary } from "../models/coverage-summary";
import {
    genSummaryMapByCoverageMap,
    resetCoverageDataMap,
    reorganizeCompleteCoverageObjects,
} from "canyon-data";
import { TestExcludeService } from "./common/test-exclude.service";
import { removeNullKeys } from "../../utils/utils";
import { decompressedData } from "../../utils/zstd";
import { convertDataFromCoverageMapDatabase } from "../../utils/coverage";
import { remapCoverageWithInstrumentCwd } from "canyon-map";

function guolv(coverageData, filepath) {
    if (filepath) {
        const newCoverageData = {};
        Object.keys(coverageData).forEach((key) => {
            if (key.includes(filepath)) {
                newCoverageData[key] = coverageData[key];
            }
        });
        return newCoverageData;
    }
    return coverageData;
}

@Injectable()
export class CoverageService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly testExcludeService: TestExcludeService,
    ) {}

    async getCoverageSummaryMap(
        projectID,
        sha: string,
        reportID: string,
    ): Promise<CoverageSummary[]> {
        const coverages = await this.prisma.coverage.findMany({
            where: {
                sha: sha,
                projectID,
                covType: "agg",
                NOT: {
                    compareTarget: {
                        equals: "",
                    },
                },
            },
            orderBy: {
                updatedAt: "desc",
            },
            select: {
                projectID: true,
                compareTarget: true,
                covType: true,
                id: true,
            },
        });
        if (coverages.length === 0) {
            return [];
        }

        const codechanges = await this.prisma.codechange.findMany({
            where: {
                compareTarget: coverages[0].compareTarget,
                sha: sha,
            },
        });

        let covSummary = await this.prisma.coverage
            .findFirst({
                where: removeNullKeys({
                    sha,
                    projectID,
                    reportID: reportID || null,
                    covType: reportID ? "agg" : "all",
                }),
            })
            .then((cov) => {
                if (cov && cov.summary) {
                    // zstd解压
                    return decompressedData(cov.summary);
                } else {
                    return null;
                }
            });

        if (!covSummary) {
            const coverageData = await this.getCoverageDataFromAdapter(
                projectID,
                sha,
                reportID,
            ).then((r) =>
                this.testExcludeService.invoke(coverages[0].projectID, r),
            );

            covSummary = genSummaryMapByCoverageMap(coverageData, codechanges);
        }

        return Object.entries(covSummary).map(([key, value]: any) => {
            return {
                path: key,
                ...value,
                change: codechanges.map(({ path }) => `${path}`).includes(key),
            };
        });
    }

    async getCoverageData(projectID, commitSha, reportID, _filepath) {
        const filepath = _filepath ? _filepath.replaceAll("~/", "") : null;
        // 获取单个需要优化
        const coverageData = await this.getCoverageDataFromAdapter(
            projectID,
            commitSha,
            reportID,
            filepath,
        );
        return coverageData;
    }

    // 私有方法
    private async getCoverageDataFromAdapter(
        projectID,
        sha,
        reportID,
        filepath = null,
    ) {
        const cov = await this.prisma.coverage.findFirst({
            where: removeNullKeys({
                sha,
                projectID,
                covType: reportID || null ? "agg" : "all",
                reportID: reportID || null,
            }),
        });
        const hit = await decompressedData(cov.hit);

        const coverageMaps = await this.prisma.coverageMap.findMany({
            where: removeNullKeys({
                sha,
                projectID,
                path: filepath,
            }),
        });

        const { map, instrumentCwd } =
            await convertDataFromCoverageMapDatabase(coverageMaps);

        // map不参与exclude过滤，需要保留完整的

        const reMapMap = await remapCoverageWithInstrumentCwd(
            resetCoverageDataMap(map),
            instrumentCwd,
        );

        const newCoverage = reorganizeCompleteCoverageObjects(
            reMapMap, //
            // @ts-ignore
            hit,
        );

        return guolv(newCoverage, filepath);
    }
}

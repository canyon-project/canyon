import { HttpException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { CoverageMapClientService } from "./coverage-map-client.service";
import { decompressedData } from "../../../utils/zstd";
import {
    convertDataFromCoverageMapDatabase,
    formatReportObject,
} from "../../../utils/coverage";
import { IstanbulHitMapSchema } from "../../../zod/istanbul.zod";
import { remapCoverageWithInstrumentCwd } from "canyon-map";
import {
    formatCoverageData,
    reorganizeCompleteCoverageObjects,
} from "canyon-data";
// import { remapCoverageWithInstrumentCwd, formatCoverageData } from "canyon-map";
import { CoveragediskService } from "./core/coveragedisk.service";

// 此代码重中之重、核心中的核心！！！
@Injectable()
export class CoverageClientService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly coverageMapClientService: CoverageMapClientService,
        private coveragediskService: CoveragediskService,
    ) {}
    async invoke({
        sha,
        projectID,
        coverage,
        instrumentCwd,
        reportID: _reportID,
        branch,
        compareTarget,
    }) {
        const reportID = _reportID || sha;
        // #region == Step x: 解析出上报上来的覆盖率数据
        const coverageFromExternalReport =
            typeof coverage === "string" ? JSON.parse(coverage) : coverage;
        // #endregion

        // 首先就要判断，这个是可选步骤，所以用单if，以statementMap来判断
        if (Object.values(coverageFromExternalReport)[0]["statementMap"]) {
            // 构建一个coverageMapClientService
            await this.coverageMapClientService.invoke({
                sha,
                projectID,
                coverage,
                instrumentCwd,
                branch: branch || "-",
                compareTarget: compareTarget || sha,
            });
        }
        const count = await this.prisma.coverageMap.count({
            where: {
                projectID: {
                    contains: projectID
                        .split("-")
                        .filter((_, index) => index < 2)
                        .join("-"),
                },
                sha: sha,
            },
        });
        if (count === 0) {
            throw new HttpException("coverage map not found", 400);
        }

        const coverageFromDatabase = await this.prisma.coverageMap
            .findMany({
                where: {
                    // tripgl-1-autoxxx
                    projectID: {
                        // 只取前两位
                        contains: projectID
                            .split("-")
                            .filter((_: any, index: number) => index < 2)
                            .join("-"),
                    },
                    sha: sha,
                },
            })
            .then((coverageMaps) => {
                return convertDataFromCoverageMapDatabase(coverageMaps);
            });

        // return coverageFromDatabase;

        // #region == Step x: db查找出对应的map数据
        const map = coverageFromDatabase.map;
        // #endregion

        // #region == Step x: 格式化上报的覆盖率对象
        const { coverage: formartCOv } = await formatReportObject({
            coverage: formatCoverageData(coverageFromExternalReport),
            instrumentCwd: instrumentCwd,
        });

        // 未经过reMapCoverage的数据
        const originalHit = IstanbulHitMapSchema.parse(formartCOv);
        // #endregion

        const chongzu = reorganizeCompleteCoverageObjects(map, originalHit);

        // #region == Step x: 覆盖率回溯，在覆盖率存储之前转换(这里一定要用数据库里的instrumentCwd，因为和map是对应的！！！)
        const hit = await remapCoverageWithInstrumentCwd(
            chongzu,
            coverageFromDatabase.instrumentCwd,
        );
        // #endregion

        //   放到本地消息队列里

        await this.coveragediskService.pushQueue({
            projectID,
            sha,
            reportID,
            coverage: hit,
        });
        return {
            success: true,
        };
    }
}

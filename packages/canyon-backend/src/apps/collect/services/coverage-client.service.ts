import { HttpException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { CoverageMapClientService } from "./coverage-map-client.service";
import { IstanbulHitMapSchema } from "../../../zod/istanbul.zod";
import { formatCoverageData, parseProjectID } from "canyon-data";
import { CoveragediskService } from "./core/coveragedisk.service";
import { CoverageFinalService } from "./common/coverage-final.service";
import {formatReportObject} from "../../../utils/coverage";

// 此代码重中之重、核心中的核心！！！
@Injectable()
export class CoverageClientService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly coverageMapClientService: CoverageMapClientService,
        private coveragediskService: CoveragediskService,
        private coverageFinalService: CoverageFinalService,
    ) {}
    async invoke({
        sha,
        projectID,
        coverage,
        instrumentCwd,
        reportID: _reportID,
        branch,
        compareTarget,
        reporter,
    }) {
        const { repoID } = parseProjectID(projectID);
        const reportID = _reportID || sha;
        // #region == Step x: 解析出上报上来的覆盖率数据
        const coverageFromExternalReport =
            typeof coverage === "string" ? JSON.parse(coverage) : coverage;
        // #endregion

        // 首先就要判断，这个是可选步骤，所以用单if，以statementMap来判断
        if (
            Object.keys(coverageFromExternalReport).length > 0 &&
            Object.values(coverageFromExternalReport)[0]["statementMap"]
        ) {
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
                repoID: {
                    contains: repoID,
                },
                sha: sha,
            },
        });
        if (count === 0) {
            throw new HttpException("coverage map not found", 400);
        }

        const { coverage: formartCOv } = formatReportObject({
            coverage: formatCoverageData(coverageFromExternalReport),
            instrumentCwd: instrumentCwd,
        });

        const originalHit = IstanbulHitMapSchema.parse(formartCOv);

        // 重要！！！，这里是reMap过的数据
        const coveragewenhao = await this.coverageFinalService.invoke(
            {
                projectID,
                sha,
                // reportID, 这里不需要reportID了
            },
            originalHit,
        );

        await this.coveragediskService.pushQueue({
            projectID,
            sha,
            reportID,
            compareTarget: compareTarget || sha,
            coverage: IstanbulHitMapSchema.parse(coveragewenhao),
            reporter,
        });
        return {
            msg: "ok",
            coverageId: "",
            dataFormatAndCheckTime: "",
            coverageInsertDbTime: "",
        };
    }
}

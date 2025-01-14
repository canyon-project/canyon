import { PrismaService } from "../../../prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { coverageObj } from "../models/coverage.model";
import {
    formatCoverageData,
    genSummaryMapByCoverageMap,
    getSummaryByPath,
    parseProjectID,
    resetCoverageDataMap,
} from "canyon-data";
import {
    IstanbulHitMapSchema,
    IstanbulMapMapSchema,
} from "../../../zod/istanbul.zod";
import { compressedData, remapCoverageWithInstrumentCwd } from "canyon-map";
import { formatReportObject } from "../../../utils/coverage";
import {summaryToDbSummary} from "../../../utils/utils";

function getNewPathByOldPath(covMap, path) {
    // @ts-ignore
    const arr = Object.values(covMap).filter((item) => item.oldPath === path);
    if (arr.length > 0) {
        // @ts-ignore
        return arr[0].path;
    } else {
        return path;
    }
}

@Injectable()
export class CoverageMapClientService {
    constructor(private readonly prisma: PrismaService) {}
    async invoke({
        sha,
        projectID,
        coverage,
        instrumentCwd,
        branch,
        compareTarget,
    }) {
        const { provider, repoID } = parseProjectID(projectID);
        const coverageFromExternalReport =
            typeof coverage === "string" ? JSON.parse(coverage) : coverage;
        // #endregion

        // 原来的代码
        // ************************************************************
        const { coverage: formatedCoverage } = formatReportObject({
            coverage: formatCoverageData(coverageFromExternalReport),
            instrumentCwd: instrumentCwd,
        });

        const formatCoverageMap = IstanbulMapMapSchema.parse(formatedCoverage);

        const resetCovMap = resetCoverageDataMap(formatCoverageMap);

        // #region == Step x: 覆盖率回溯，在覆盖率存储之前转换(这里一定要用数据库里的instrumentCwd，因为和map是对应的！！！)
        const hitObject: any = await remapCoverageWithInstrumentCwd(
            resetCovMap,
            instrumentCwd,
        );

        // const compressedFormatCoverageStr =
        //     await compressedData(formatCoverageMap);
        const hit = await compressedData(IstanbulHitMapSchema.parse(hitObject));

        const summaryObject = genSummaryMapByCoverageMap(hitObject, []);
        const overallSummary: any = getSummaryByPath("", summaryObject);
        const summary = await compressedData(summaryObject);
        // ************************************************************
        // 原来的代码

        // 提前插入
        await this.prisma.coverage
            .create({
                data: {
                    ...coverageObj,
                    id: `__${projectID}__${sha}__`,
                    sha: sha,
                    projectID: projectID,
                    branch: branch,
                    summary: summary,
                    hit: hit,
                    ...summaryToDbSummary(overallSummary),
                    reportID: sha,
                    compareTarget: compareTarget || sha, // 默认是自己
                    reporter: "canyon",
                },
            })
            .catch(() => {
                // console.log("coverage create error");
            });

        /*
        这里的逻辑是每次批量插入上报的map数据，按文件存，不更新。
        借助于数据库的id不重复，保证了数据不会重复插入。
         // TODO 不确定对数据库的压力，是否需要优化
         */

        const arr = Object.entries(formatCoverageMap).map(([path, map]) => {
            return {
                ...map,
                path,
            };
        });

        const compressedArr = await Promise.all(
            arr.map((item) => {
                return compressedData(item).then((map) => {
                    return {
                        path: item.path,
                        map,
                    };
                });
            }),
        );

        // 避免重复录入
        return await this.prisma.coverageMap.createMany({
            data: compressedArr.map(({ path, map }: any) => {
                return {
                    id: `__${provider}__${repoID}__${sha}__${path}__`,
                    map: map, //???没删除bfs
                    provider: provider,
                    repoID: repoID,
                    sha: sha,
                    path: getNewPathByOldPath(hitObject, path),
                    instrumentCwd: instrumentCwd,
                };
            }),
            skipDuplicates: true,
        });
    }
}

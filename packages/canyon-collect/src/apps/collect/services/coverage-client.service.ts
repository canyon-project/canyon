import { HttpException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
// import { CoveragediskService } from "./core/coveragedisk.service";

// 此代码重中之重、核心中的核心！！！
@Injectable()
export class CoverageClientService {
    constructor(
        private readonly prisma: PrismaService,
        // private coveragediskService: CoveragediskService,
    ) {}
    async invoke({
        sha,
        projectID,
        coverage,
        instrumentCwd,
        reportID: _reportID,
    }) {
        const reportID = _reportID || sha;
        // #region == Step x: 解析出上报上来的覆盖率数据
        const coverageFromExternalReport =
            typeof coverage === "string" ? JSON.parse(coverage) : coverage;
        // #endregion

        // 首先就要判断，这个是可选步骤，所以用单if
        if (true) {
            // 插入一个all类型，不重复，就是为了插入buildID，branch等信息而已，数据也是空的
            // await this.prisma.coverage.create({
            //     data: {
            //         projectID: projectID,
            //         sha: sha,
            //         reportID: "",
            //         size: JSON.stringify(coverage).length,
            //         createdAt: new Date(),
            //         coverage: "",
            //         tags: "",
            //         ip: "999999999",
            //         userAgent: "",
            //         instrumentCwd: instrumentCwd,
            //         branch: branch,
            //     },
            // });

            //     判断是否包含map数据，如果包含需先存储map数据
            const arr = Object.entries(coverage).map(([path, map]) => {
                return { path, map };
            });

            await this.prisma.coverageMap.createMany({
                data: arr.map(({ path, map }: any) => {
                    return {
                        id: `__${projectID}__${sha}__${path}__`,
                        map: map, //???没删除bfs
                        projectID: projectID,
                        sha: sha,
                        path: path,
                    };
                }),
                skipDuplicates: true,
            });
        }
    }
}

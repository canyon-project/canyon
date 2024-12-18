import { PrismaService } from "../../../prisma/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CoverageMapClientService {
    constructor(private readonly prisma: PrismaService) {}
    async invoke({ sha, projectID, coverage, instrumentCwd, branch }) {
        const coverageFromExternalReport =
            typeof coverage === "string" ? JSON.parse(coverage) : coverage;
        // #endregion

        // 提前插入
        await this.prisma.coverage.create({
            data: {
                projectID: projectID,
                sha: sha,
                reportID: "",
                size: JSON.stringify(coverage).length,
                createdAt: new Date(),
                coverage: "",
                tags: "",
                ip: "999999999",
                userAgent: "",
                instrumentCwd: instrumentCwd,
                branch: branch,
            },
        });

        /*
        这里的逻辑是每次批量插入上报的map数据，按文件存，不更新。
        借助于数据库的id不重复，保证了数据不会重复插入。
         // TODO 不确定对数据库的压力，是否需要优化
         */

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

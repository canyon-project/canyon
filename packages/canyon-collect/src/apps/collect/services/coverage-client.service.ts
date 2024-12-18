import { HttpException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { CoveragediskService } from "./core/coveragedisk.service";

// 此代码重中之重、核心中的核心！！！
@Injectable()
export class CoverageClientService {
    constructor(
        private readonly prisma: PrismaService,
        private coveragediskService: CoveragediskService,
    ) {}
    async invoke({
        sha,
        projectID,
        coverage,
        instrumentCwd,
        reportID: _reportID,
    }) {
        // 首先就要判断，这个是可选步骤，所以用单if
        if (true) {
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

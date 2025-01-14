import { PrismaService } from "../../../../prisma/prisma.service";
import { parseProjectID } from "canyon-data";
import { Injectable } from "@nestjs/common";
import {diffLine} from "../../../../utils/diffline";

@Injectable()
export class PullChangeCodeAndInsertDbService {
    constructor(private readonly prisma: PrismaService) {}
    async invoke({ projectID, sha, compareTarget }) {
        const { provider, repoID } = parseProjectID(projectID);
        const codechanges = await this.prisma.codechange.findMany({
            where: {
                sha: sha,
                compareTarget,
            },
        });
        const gitProvider = await this.prisma.gitProvider.findFirst({
            where: {
                disabled: false,
            },
        });
        if (codechanges.length === 0) {
            const diffLineData = await diffLine({
                repoID: repoID,
                baseCommitSha: compareTarget,
                compareCommitSha: sha,
                token: gitProvider?.privateToken,
                gitlabUrl: gitProvider?.url,
            });
            const data = diffLineData.map(({ path, additions, deletions }) => {
                return {
                    provider,
                    repoID,
                    sha: sha,
                    compareTarget,
                    path,
                    additions,
                    deletions,
                };
            });

            await this.prisma.codechange.createMany({
                data: data,
            });
        }
    }
}

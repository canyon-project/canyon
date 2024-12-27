// import { diffLine } from "../../../utils/diffline";

import { diffLine } from "../../../../utils/diffline";

export class PullChangeCodeAndInsertDbService {
    async invoke(projectID, commitSha, compareTarget, accessToken, prisma) {
        const codechanges = await prisma.codechange.findMany({
            where: {
                sha: commitSha,
                compareTarget,
            },
        });
        const gitProvider = await prisma.gitProvider.findFirst({
            where: {
                disabled: false,
            },
        });
        if (codechanges.length === 0) {
            const diffLineData = await diffLine({
                repoID: projectID,
                baseCommitSha: compareTarget,
                compareCommitSha: commitSha,
                token: gitProvider?.privateToken,
                gitlabUrl: gitProvider?.url,
            });
            const data = diffLineData.map(({ path, additions, deletions }) => {
                return {
                    projectID,
                    sha: commitSha,
                    compareTarget,
                    path,
                    additions,
                    deletions,
                };
            });

            await prisma.codechange.createMany({
                data: data,
            });
        }
    }
}

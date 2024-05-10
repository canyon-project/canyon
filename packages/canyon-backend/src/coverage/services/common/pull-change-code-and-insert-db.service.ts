import { diffLine } from '../../../utils/diffline';

export class PullChangeCodeAndInsertDbService {
  async invoke(projectID, commitSha, compareTarget, accessToken, prisma) {
    const codechanges = await prisma.codechange.findMany({
      where: {
        projectID,
        sha: commitSha,
        compareTarget,
      },
    });
    if (codechanges.length === 0) {
      const diffLineData = await diffLine({
        repoID: projectID,
        baseCommitSha: compareTarget,
        compareCommitSha: commitSha,
        token: accessToken,
        gitlabUrl: process.env.GITLAB_URL,
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

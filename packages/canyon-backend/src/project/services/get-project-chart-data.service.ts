import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { percent, removeNullKeys } from "../../utils/utils";
// import { getProjectByID } from '../adapter/gitlab.adapter';
@Injectable()
export class GetProjectChartDataService {
  constructor(private readonly prisma: PrismaService) {}
  async invoke(projectID, branch) {
    const { defaultBranch } = await this.prisma.project.findFirst({
      where: {
        id: projectID,
      },
    });
    const allCovTypeCoverages = await this.prisma.coverage.findMany({
      where: removeNullKeys({
        projectID: projectID,
        covType: "all",
        branch: defaultBranch === "-" ? null : defaultBranch,
        // NOT: {
        //   summary: {
        //     path: ["statements", "covered"],
        //     equals: 0,
        //   },
        // },
      }),
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        sha: true,
        statementsCovered: true,
        statementsTotal: true,
        newlinesCovered: true,
        newlinesTotal: true,
      },
    });

    return allCovTypeCoverages
      .map((item) => {
        return {
          sha: item.sha,
          statements: percent(item.statementsCovered, item.statementsTotal),
          newlines: percent(item.newlinesCovered, item.newlinesCovered),
        };
      })
      .reverse();
  }
}

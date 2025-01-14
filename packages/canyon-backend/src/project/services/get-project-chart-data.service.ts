import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { percent } from "canyon-data";

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
      where: {
        projectID: projectID,
        covType: "all",
        branch: defaultBranch === "-" ? undefined : defaultBranch,
        NOT: {
          statementsCovered: 0,
          // 老的逻辑，不再使用
          // summary: {
          //   path: ["statements", "covered"],
          //   equals: 0,
          // },
        },
        // NOT: {
        //   summary: {
        //     path: ["statements", "covered"],
        //     equals: 0,
        //   },
        // },
      },
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

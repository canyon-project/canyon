import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class GetCoverageLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async invoke() {
    const logs = await this.prisma.coverageLog.findMany({
      where: {
        // projectID: "1",
      },
      skip: 0,
      take: 10,
    });
    return {
      data: logs.map((item) => ({
        id: String(item.id),
        projectID: item.projectID,
        sha: item.sha,
        reportID: item.reportID,
        size: item.size,
        tags: [
          {
            label: "triggerHook",
            value: "pageWillDisappear",
          },
        ],
      })),
      total: 0,
    };
  }
}

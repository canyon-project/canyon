import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import * as dayjs from "dayjs";
import { percent, removeNullKeys } from "../../utils/utils";

@Injectable()
export class GetProjectCompartmentDataService {
  constructor(private readonly prisma: PrismaService) {}
  async invoke(projectID) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectID,
      },
    });
    const coverages = await this.prisma.coverage.findMany({
      where: removeNullKeys({
        projectID: projectID,
        covType: "all",
        branch: ["", "-"].includes(project.defaultBranch)
          ? null
          : project.defaultBranch,
      }),
      orderBy: {
        updatedAt: "desc",
      },
    });
    if (coverages.length > 0) {
      return [
        {
          label: "projects.total_times",
          value: String(coverages.length),
        },
        {
          label: "projects.max_coverage",
          value:
            Math.max(...coverages.map((c) => c.summary["statements"]["pct"])) +
            "%",
        },
        {
          label: "projects.latest_report_time",
          value: dayjs(coverages[0].updatedAt).format("MM-DD HH:mm"),
        },
        {
          label: "projects.latest_report_coverage",
          value: coverages[0].summary["statements"]["pct"] + "%",
        },
      ];
    } else {
      return [
        {
          label: "projects.total_times",
          value: "0",
        },
        {
          label: "projects.max_coverage",
          value: "0%",
        },
        {
          label: "projects.latest_report_time",
          value: "0",
        },
        {
          label: "projects.latest_report_coverage",
          value: "0%",
        },
      ];
    }
  }
}

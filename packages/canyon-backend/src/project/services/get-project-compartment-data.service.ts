import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import * as dayjs from "dayjs";
import { percent } from "canyon-data";

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
            where: {
                projectID: projectID,
                covType: "all",
                branch: ["", "-"].includes(project.defaultBranch)
                    ? undefined
                    : project.defaultBranch,
            },
            orderBy: {
                updatedAt: "desc",
            },
            select: {
                statementsCovered: true,
                statementsTotal: true,
                updatedAt: true,
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
                        Math.max(
                            ...coverages.map((c) =>
                                percent(c.statementsCovered, c.statementsTotal),
                            ),
                        ) + "%",
                },
                {
                    label: "projects.latest_report_time",
                    value: dayjs(coverages[0].updatedAt).format("MM-DD HH:mm"),
                },
                {
                    label: "projects.latest_report_coverage",
                    value:
                        percent(
                            coverages[0].statementsCovered,
                            coverages[0].statementsTotal,
                        ) + "%",
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

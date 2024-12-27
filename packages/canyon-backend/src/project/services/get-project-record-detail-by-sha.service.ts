import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { percent } from "canyon-data";
@Injectable()
export class GetProjectRecordDetailByShaService {
    constructor(private readonly prisma: PrismaService) {}
    async invoke(projectID, sha): Promise<any> {
        const current = 1;
        const pageSize = 200;
        const coverages = await this.prisma.coverage.findMany({
            where: {
                projectID,
                sha,
                covType: "agg",
            },
            skip: (current - 1) * pageSize,
            take: pageSize,
            orderBy: {
                updatedAt: "desc",
            },
            select: {
                id: true,
                sha: true,
                reportID: true,
                statementsCovered: true,
                statementsTotal: true,
                newlinesCovered: true,
                newlinesTotal: true,
                createdAt: true,
                updatedAt: true,
                reporter: true,
            },
        });
        const users = await this.prisma.user.findMany({
            where: {},
        });
        const rows = [];

        for (let i = 0; i < coverages.length; i++) {
            const coverage = coverages[i];
            console.log(coverage.reporter, "coverage.reporter");
            const data = {
                ...coverage,
                relationID: "",
                compareUrl: "",
                webUrl: "",
                statements: percent(
                    coverage.statementsCovered,
                    coverage.statementsTotal,
                ),
                newlines: percent(
                    coverage.newlinesCovered,
                    coverage.newlinesTotal,
                ),
                lastReportTime: coverage.updatedAt,
                times: 0,
                logs: [],
                message: "",
                reporterUsername:
                    users.find(({ id: uId }) => {
                        return String(uId) === coverage.reporter;
                    })?.nickname || "not found",
                reporterAvatar:
                    users.find(
                        ({ id: uId }) => String(uId) === coverage.reporter,
                    )?.avatar || "not found",
            };
            rows.push(data);
        }
        return rows;
    }
}

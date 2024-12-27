import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { getCommits } from "../../adapter/gitlab.adapter";
import { percent } from "canyon-data";
@Injectable()
export class GetProjectRecordsService {
    constructor(private readonly prisma: PrismaService) {}
    async invoke(
        projectID,
        current,
        pageSize,
        keyword,
        onlyDefault,
    ): Promise<any> {
        const project = await this.prisma.project.findFirst({
            where: {
                id: projectID,
            },
        });
        const whereCondition = {
            projectID,
            covType: "all",
            branch: project.defaultBranch,
            OR: [
                // { description: { contains: keyword } },
                // { name: { contains: keyword } },
                { sha: { contains: keyword } },
                { branch: { contains: keyword } },
                { compareTarget: { contains: keyword } },
                // { message: { contains: keyword } },
            ],
            NOT: {
                statementsCovered: 0,
                // 老的逻辑，不再使用
                // summary: {
                //   path: ["statements", "covered"],
                //   equals: 0,
                // },
            },
        };

        if (Boolean(onlyDefault) && project.defaultBranch !== "-") {
        } else {
            delete whereCondition.branch;
        }

        const total = await this.prisma.coverage.count({
            where: whereCondition,
        });
        const coverages = await this.prisma.coverage.findMany({
            where: whereCondition,
            skip: (current - 1) * pageSize,
            take: pageSize,
            orderBy: {
                updatedAt: "desc",
            },
            select: {
                sha: true,
                compareTarget: true,
                branch: true,
                buildID: true,
                buildProvider: true,
                createdAt: true,
                updatedAt: true,
                statementsCovered: true,
                statementsTotal: true,
                functionsCovered: true,
                functionsTotal: true,
                branchesCovered: true,
                branchesTotal: true,
                linesCovered: true,
                linesTotal: true,
                newlinesCovered: true,
                newlinesTotal: true,
            },
        });
        const gitProvider = await this.prisma.gitProvider.findFirst({
            where: {
                disabled: false,
            },
        });
        const commits = await getCommits(
            {
                projectID: projectID.split("-")[1],
                commitShas: coverages.map((item) => item.sha),
            },
            gitProvider?.privateToken,
            gitProvider?.url,
        );
        // const commits = [];
        const rows = [];

        const csList = await Promise.all(
            coverages.map((coverage) =>
                this.prisma.coverage.findMany({
                    where: {
                        projectID,
                        sha: coverage.sha,
                        covType: "agg",
                    },
                    select: {
                        createdAt: true,
                        updatedAt: true,
                    },
                    orderBy: {
                        updatedAt: "desc",
                    },
                }),
            ),
        );

        for (let i = 0; i < coverages.length; i++) {
            const coverage = coverages[i];

            const cs = csList[i];

            const data = {
                ...coverage,
                compareUrl: `${gitProvider?.url}/${project.pathWithNamespace}/-/compare/${coverage.compareTarget}...${coverage.sha}`,
                webUrl:
                    commits.find(({ id }) => id === coverage.sha)?.web_url ||
                    "???",
                message:
                    commits.find(({ id }) => id === coverage.sha)?.message ||
                    "???",
                statements: percent(
                    coverage.statementsCovered,
                    coverage.statementsTotal,
                ),
                functions: percent(
                    coverage.functionsCovered,
                    coverage.functionsTotal,
                ),
                branches: percent(
                    coverage.branchesCovered,
                    coverage.branchesTotal,
                ),
                lines: percent(coverage.linesCovered, coverage.linesTotal),
                newlines: percent(
                    coverage.newlinesCovered,
                    coverage.newlinesTotal,
                ),
                // statements: coverage.summary["statements"]["pct"],
                // functions: coverage.summary["functions"]["pct"],
                // branches: coverage.summary["branches"]["pct"],
                // lines: coverage.summary["lines"]["pct"],
                lastReportTime: cs[0]?.updatedAt || coverage.createdAt, //没有agg类型的时候就用all的创建时间
                times: cs.length,
                logs: [],
                buildID: coverage.buildID,
                buildProvider: coverage.buildProvider,
                buildURL:
                    coverage.buildProvider === "mpaas"
                        ? `${atob("aHR0cHM6Ly9tcGFhcy5jdHJpcGNvcnAuY29tL3NwcmluZy9tY2R2Mi9wYWNrYWdlUHVibGlzaFYyL1JlYWN0TmF0aXZl") || "??"}?appId=${coverage.buildID.split("|")[0]}&module=${coverage.buildID.split("|")[1]}&filters={"buildId":"${coverage.buildID.split("|")[2]}"}`
                        : `${gitProvider?.url}/${project.pathWithNamespace}/-/jobs/${coverage.buildID}`,
            };
            rows.push(data);
        }
        return {
            data: rows,
            total,
        };
    }
}

//get-project-record-detail-by-sha.service.ts

import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { percent, removeNullKeys } from "../../utils/utils";
import { emptyStatistics } from "../../constant";

@Injectable()
export class RetrieveCoverageTreeSummaryService {
  constructor(private readonly prisma: PrismaService) {}

  async invoke(params: { reportID?: string; sha?: string }) {
    const redirectUri = process.env.REDIRECT_URI;

    try {
      const summaryFindFirst = await this.prisma.coverage.findFirst({
        where: removeNullKeys({
          reportID: params.reportID,
          sha: params.sha,
          covType: "agg",
          projectID: {
            mode: "insensitive", // Ignore case sensitivity
            not: {
              contains: "-ut",
            },
          },
        }),
        select: {
          sha: true,
        },
      });

      const sha = summaryFindFirst?.sha;
      const noCommitShaWithCoverage = await this.prisma.coverage.findFirst({
        where: removeNullKeys({
          reportID: params.reportID,
          sha: params.sha,
          projectID: {
            mode: "insensitive", // Ignore case sensitivity
            not: {
              contains: "-ut",
            },
          },
        }),
        select: {
          sha: true,
          projectID: true,
        },
      });
      const project = await this.prisma.project.findFirst({
        where: {
          id: noCommitShaWithCoverage.projectID,
        },
      });
      if (!sha) {
        return {
          status: "pending",
          reportIDs: [],
          sha: noCommitShaWithCoverage?.sha || "",
          statistics: emptyStatistics,
          projectID: noCommitShaWithCoverage?.projectID || "",
          projectPathWithNamespace: project?.pathWithNamespace || "",
        };
      }

      const users = await this.prisma.user.findMany();

      const coverageAggs = await this.prisma.coverage.findMany({
        where: {
          sha,
          covType: "agg",
          projectID: {
            mode: "insensitive", // Ignore case sensitivity
            not: {
              contains: "-ut",
            },
          },
        },
        select: {
          reportID: true,
          reporter: true,
          updatedAt: true,
          linesTotal: true,
          linesCovered: true,
          functionsTotal: true,
          functionsCovered: true,
          branchesTotal: true,
          branchesCovered: true,
          statementsTotal: true,
          statementsCovered: true,
          newlinesTotal: true,
          newlinesCovered: true,
          projectID: true,
        },
      });

      const reportIDs = coverageAggs.map((coverageAgg) => {
        return {
          reportID: coverageAgg.reportID,
          reporter: Number(coverageAgg.reporter),
          reporterUsername:
            users.find((user) => user.id === Number(coverageAgg.reporter))
              ?.username || "",
          reporterTime: coverageAgg.updatedAt,
          statistics: {
            newlines: {
              total: coverageAgg.newlinesTotal,
              covered: coverageAgg.newlinesCovered,
              pct: percent(
                coverageAgg.newlinesCovered,
                coverageAgg.newlinesTotal,
              ),
            },
            lines: {
              total: coverageAgg.linesTotal,
              covered: coverageAgg.linesCovered,
              pct: percent(coverageAgg.linesCovered, coverageAgg.linesTotal),
            },
            functions: {
              total: coverageAgg.functionsTotal,
              covered: coverageAgg.functionsCovered,
              pct: percent(
                coverageAgg.functionsCovered,
                coverageAgg.functionsTotal,
              ),
            },
            branches: {
              total: coverageAgg.branchesTotal,
              covered: coverageAgg.branchesCovered,
              pct: percent(
                coverageAgg.branchesCovered,
                coverageAgg.branchesTotal,
              ),
            },
            statements: {
              total: coverageAgg.statementsTotal,
              covered: coverageAgg.statementsCovered,
              pct: percent(
                coverageAgg.statementsCovered,
                coverageAgg.statementsTotal,
              ),
            },
          },
        };
      });

      const coverageAll = await this.prisma.coverage.findFirst({
        where: {
          sha,
          covType: "all",
          projectID: {
            mode: "insensitive", // Ignore case sensitivity
            not: {
              contains: "-ut",
            },
          },
        },
        select: {
          linesTotal: true,
          linesCovered: true,
          functionsTotal: true,
          functionsCovered: true,
          branchesTotal: true,
          branchesCovered: true,
          statementsTotal: true,
          statementsCovered: true,
          newlinesTotal: true,
          newlinesCovered: true,
        },
      });

      return {
        status: "success",
        reportIDs: reportIDs,
        reportUrl: `${(redirectUri || "").replace("/oauth", "")}/projects/${coverageAggs[0]?.projectID || ""}/commits/${sha}`,
        sha: sha,
        statistics: {
          newlines: {
            total: coverageAll?.newlinesTotal || 0,
            covered: coverageAll?.newlinesCovered || 0,
            pct: percent(
              coverageAll?.newlinesCovered || 0,
              coverageAll?.newlinesTotal || 0,
            ),
          },
          lines: {
            total: coverageAll?.linesTotal || 0,
            covered: coverageAll?.linesCovered || 0,
            pct: percent(
              coverageAll?.linesCovered || 0,
              coverageAll?.linesTotal || 0,
            ),
          },
          functions: {
            total: coverageAll?.functionsTotal || 0,
            covered: coverageAll?.functionsCovered || 0,
            pct: percent(
              coverageAll?.functionsCovered || 0,
              coverageAll?.functionsTotal || 0,
            ),
          },
          branches: {
            total: coverageAll?.branchesTotal || 0,
            covered: coverageAll?.branchesCovered || 0,
            pct: percent(
              coverageAll?.branchesCovered || 0,
              coverageAll?.branchesTotal || 0,
            ),
          },
          statements: {
            total: coverageAll?.statementsTotal || 0,
            covered: coverageAll?.statementsCovered || 0,
            pct: percent(
              coverageAll?.statementsCovered || 0,
              coverageAll?.statementsTotal || 0,
            ),
          },
        },
        projectID: coverageAggs[0]?.projectID || "",
        projectPathWithNamespace: project.pathWithNamespace,
      };
    } catch (e) {
      return {
        status: "success",
        reportIDs: [],
        sha: params.sha || "",
        statistics: emptyStatistics,
        projectID: "",
        projectPathWithNamespace: "",
      };
    }
  }
}

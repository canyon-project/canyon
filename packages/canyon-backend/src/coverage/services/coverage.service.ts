import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CoverageSummary } from "../models/coverage-summary";
import { genSummaryMapByCoverageMap } from "canyon-data";
import { TestExcludeService } from "./common/test-exclude.service";
import { removeNullKeys } from "../../utils/utils";
import { decompressedData } from "../../utils/zstd";

@Injectable()
export class CoverageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly testExcludeService: TestExcludeService,
  ) {}

  async getCoverageSummaryMap(
    projectID,
    sha: string,
    reportID: string,
  ): Promise<CoverageSummary[]> {
    const coverages = await this.prisma.coverage.findMany({
      where: {
        sha: sha,
        projectID,
        covType: "agg",
        // NOT: {
        //   projectID: {
        //     contains: '-ut',
        //   },
        // },
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        projectID: true,
        compareTarget: true,
      },
    });
    if (coverages.length === 0) {
      return [];
    }
    const coverageData = await this.getCoverageDataFromAdapter(
      projectID,
      sha,
      reportID,
    ).then((r) => this.testExcludeService.invoke(coverages[0].projectID, r));
    const codechanges = await this.prisma.codechange.findMany({
      where: {
        compareTarget: coverages[0].compareTarget,
        sha: sha,
      },
    });
    const covSummary = genSummaryMapByCoverageMap(coverageData, codechanges);
    return Object.entries(covSummary).map(([key, value]) => {
      return {
        path: key,
        ...value,
        change: codechanges.map(({ path }) => `~/${path}`).includes(key),
      };
    });
  }

  async getCoverageData(projectID, commitSha, reportID, filepath) {
    // 获取单个需要优化
    const coverageData = await this.getCoverageDataFromAdapter(
      projectID,
      commitSha,
      reportID,
      filepath,
    );
    return JSON.stringify(coverageData[filepath]);
  }

  // 私有方法
  private async getCoverageDataFromAdapter(
    projectID,
    sha,
    reportID,
    filepath = null,
  ) {
    const cov = await this.prisma.coverage.findFirst({
      where: removeNullKeys({
        sha,
        projectID,
        covType: reportID || null ? "agg" : "all",
        reportID: reportID || null,
      }),
    });
    const hit = JSON.parse(await decompressedData(cov.hit));
    const map = JSON.parse(await decompressedData(cov.map));
    const obj = {};
    Object.entries(hit).forEach(([key, value]: any) => {
      obj["~/" + key] = {
        ...value,
        ...map[key],
        path: "~/" + key,
      };
    });
    return obj;
  }
}

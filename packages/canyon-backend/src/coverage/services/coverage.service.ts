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

    const codechanges = await this.prisma.codechange.findMany({
      where: {
        compareTarget: coverages[0].compareTarget,
        sha: sha,
      },
    });

    let covSummary = await this.prisma.coverage
      .findFirst({
        where: removeNullKeys({
          sha,
          projectID,
          reportID: reportID || null,
          covType: reportID ? "agg" : "all",
        }),
      })
      .then((cov) => {
        if (cov && cov.summary) {
          // zstd解压
          return decompressedData(cov.summary).then((summary) => {
            return JSON.parse(summary);
          });
        } else {
          return null;
        }
      });

    if (!covSummary) {
      const coverageData = await this.getCoverageDataFromAdapter(
        projectID,
        sha,
        reportID,
      ).then((r) => this.testExcludeService.invoke(coverages[0].projectID, r));

      covSummary = genSummaryMapByCoverageMap(coverageData, codechanges);
    }

    return Object.entries(covSummary).map(([key, value]: any) => {
      return {
        path: key,
        ...value,
        change: codechanges.map(({ path }) => `${path}`).includes(key),
      };
    });
  }

  async getCoverageData(projectID, commitSha, reportID, _filepath) {
    const filepath = _filepath ? _filepath.replaceAll("~/", "") : null;
    // 获取单个需要优化
    const coverageData = await this.getCoverageDataFromAdapter(
      projectID,
      commitSha,
      reportID,
      filepath,
    );
    return coverageData;
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

    const coverageMaps = await this.prisma.coverageMap.findMany({
      where: removeNullKeys({
        sha,
        projectID,
        path: filepath,
      }),
    });

    const coverageJsonMaps = await Promise.all(
      coverageMaps.map((coverageMap) => {
        return decompressedData(coverageMap.map).then((map) => {
          return {
            ...coverageMap,
            ...JSON.parse(map),
          };
        });
      }),
    );
    const obj = {};
    coverageJsonMaps.forEach((item) => {
      if (hit[item.path]) {
        const o = {
          ...hit[item.path],
          ...item,
          path: item.path,
        };
        obj[item.path] = {
          path: o.path,
          b: o.b || {},
          f: o.f || {},
          s: o.s || {},
          branchMap: o.branchMap || {},
          fnMap: o.fnMap || {},
          statementMap: o.statementMap || {},
        };
      }
    });
    return obj;
  }
}

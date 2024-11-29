import { PrismaService } from "../../../prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { IstanbulMapMapSchema } from "../../../zod/istanbul.zod";
import { compressedData, decompressedData } from "../../../utils/zstd";
import { formatReportObject } from "../../../utils/coverage";
import { coverageObj } from "../models/coverage.model";
import {
  formatCoverageData,
  remapCoverageWithInstrumentCwd,
} from "canyon-data2";
import {
  genSummaryMapByCoverageMap,
  getSummaryByPath,
} from "../../../canyon-data/src";

@Injectable()
export class CoverageMapClientService {
  constructor(private readonly prisma: PrismaService) {}
  async invoke({ sha, projectID, coverage, instrumentCwd, branch }) {
    const exist = await this.prisma.coverage.findFirst({
      where: {
        sha: sha,
        projectID: projectID,
        covType: "all",
      },
    });
    const originCoverage = await this.convertTheReportedMap({
      coverage,
      instrumentCwd,
    });

    const formatCoverageMap = IstanbulMapMapSchema.parse(originCoverage);
    if (exist) {
      return await this.updateMap({
        exist,
        newMap: formatCoverageMap,
      });
    } else {
      const inithitMapCWanzhen = await remapCoverageWithInstrumentCwd(
        originCoverage,
        instrumentCwd,
      );

      const inithitStr = await compressedData(inithitMapCWanzhen);

      const summary = genSummaryMapByCoverageMap(inithitMapCWanzhen, []);
      const sum: any = getSummaryByPath("", summary);
      const summaryZstd = await compressedData(summary);

      const compressedFormatCoverageStr =
        await compressedData(formatCoverageMap);
      return this.prisma.coverage
        .create({
          data: {
            ...coverageObj,
            branch: branch || "-",
            compareTarget: sha,
            provider: "github",
            buildProvider: "github",
            buildID: "",
            projectID: projectID,
            sha: sha,
            reporter: "canyon",
            reportID: sha,
            covType: "all", //map都是all
            statementsCovered: 0,
            statementsTotal: sum.statements.total,
            //空bytes
            summary: summaryZstd,
            hit: inithitStr,
            map: compressedFormatCoverageStr,
            instrumentCwd: instrumentCwd,
          },
        })
        .then((r) => {
          return {
            id: r.id,
            projectID: r.projectID,
            sha: r.sha,
          };
        });
    }
  }
  async updateMap({ exist, newMap }) {
    const oldMap = await decompressedData(exist.map);
    const map = await compressedData({
      ...oldMap,
      ...newMap,
    });
    return this.prisma.coverage.update({
      where: {
        id: exist.id,
      },
      data: {
        map: map,
      },
    });
  }
  async createMap({ sha, projectID, coverage, instrumentCwd }) {}

  async convertTheReportedMap({ coverage, instrumentCwd }) {
    const coverageObject =
      typeof coverage === "string" ? JSON.parse(coverage) : coverage;
    const { coverage: formatedCoverage } = await formatReportObject({
      coverage: formatCoverageData(coverageObject),
      instrumentCwd: instrumentCwd,
    });
    return formatedCoverage;
  }
}

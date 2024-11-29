import { PrismaService } from "../../../prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { IstanbulMapMapSchema } from "../../../zod/istanbul.zod";
import { compressedData, decompressedData } from "../../../utils/zstd";
import { formatReportObject } from "../../../utils/coverage";
import { coverageObj } from "../models/coverage.model";
import {
  formatCoverageData,
  remapCoverageWithInstrumentCwd,
  resetCoverageDataMap,
} from "canyon-data2";
import {
  genSummaryMapByCoverageMap,
  getSummaryByPath,
} from "../../../canyon-data/src";
import { reorganizeCompleteCoverageObjects } from "canyon-data2/src";
import { mergeCoverageMap } from "canyon-data";
// import { resetCoverageDataMap } from "canyon-data2/src";

@Injectable()
export class CoverageMapClientService {
  constructor(private readonly prisma: PrismaService) {}
  async invoke({ projectID, sha, coverage, instrumentCwd }) {
    const exist = await this.prisma.coverage.findFirst({
      where: {
        sha: sha,
        projectID: projectID,
        covType: "all",
      },
    });
    // originCoverage 是替换掉了instrumentCwd的coverage，未经reMap的，没有fbs
    // coverage也是未处理过了的
    const formatCoverageMap = await this.convertTheReportedMap({
      coverage,
      instrumentCwd,
    });

    if (exist) {
      return await this.updateMap({
        newMap: formatCoverageMap,
        exist,
      });
    } else {
      return await this.createMap({
        newMap: formatCoverageMap,
        sha,
        projectID,
        instrumentCwd,
      });
    }
  }
  async updateMap({ exist, newMap }) {
    const oldMap = await decompressedData(exist.map);
    const oldHit = await decompressedData(exist.hit);
    const { hit, map, summary, statementsTotal } = await this.generateData({
      newMap: {
        ...oldMap,
        ...newMap,
      },
      instrumentCwd: exist.instrumentCwd,
      oldHit,
    });

    return this.prisma.coverage
      .update({
        where: {
          id: exist.id,
        },
        data: {
          map: map,
          summary,
          hit,
          statementsTotal,
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
  async createMap({ sha, projectID, newMap, instrumentCwd }) {
    const { hit, map, summary, statementsTotal } = await this.generateData({
      newMap,
      instrumentCwd,
      oldHit: {},
    });
    return this.prisma.coverage
      .create({
        data: {
          ...coverageObj,
          branch: "-",
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
          statementsTotal,
          //空bytes
          summary,
          hit,
          map,
          instrumentCwd,
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

  async convertTheReportedMap({ coverage, instrumentCwd }) {
    const coverageObject =
      typeof coverage === "string" ? JSON.parse(coverage) : coverage;
    const { coverage: formatedCoverage } = await formatReportObject({
      coverage: formatCoverageData(coverageObject),
      instrumentCwd: instrumentCwd,
    });
    // const formatCoverageMap = IstanbulMapMapSchema.parse(originCoverage);
    return IstanbulMapMapSchema.parse(formatedCoverage);
  }

  // newMap是未经过reMap的数据，并且没有fbs
  async generateData({ newMap, instrumentCwd, oldHit }) {
    const newHit = await remapCoverageWithInstrumentCwd(
      resetCoverageDataMap(newMap),
      instrumentCwd,
    );

    // const newHit = resetCoverageDataMap(reMapMap);

    const mergedHit = mergeCoverageMap(oldHit, newHit);

    const hitBuffer = await compressedData(mergedHit);
    const summary = genSummaryMapByCoverageMap(mergedHit, []);
    const overallSummary: any = getSummaryByPath("", summary);
    const summaryBuffer = await compressedData(summary);
    const mapBuffer = await compressedData(newMap);
    return {
      summary: summaryBuffer,
      hit: hitBuffer,
      map: mapBuffer,
      statementsTotal: overallSummary.statements.total,
    };
  }
}

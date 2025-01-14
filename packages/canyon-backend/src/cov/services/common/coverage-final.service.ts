import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import {
  remapCoverageWithInstrumentCwd,
  convertDataFromCoverageMapDatabase,
  decompressedData,
} from "canyon-map";
import {
  mergeCoverageMap,
  parseProjectID,
  reorganizeCompleteCoverageObjects,
  resetCoverageDataMap,
} from "canyon-data";

/*
 *  最终覆盖率服务，接收projectID, sha, reportID，filepath，返回覆盖率数据，
 * 第二个参数是hit，也可以外部传入hit生成覆盖率数据
 */

@Injectable()
export class CoverageFinalService {
  constructor(private readonly prisma: PrismaService) {}
  async invoke(
    {
      projectID,
      sha,
      reportID,
      filepath,
    }: {
      projectID: string;
      sha: string;
      reportID?: string;
      filepath?: string;
    },
    hit?: { [key: string]: object },
  ) {
    const { provider, repoID } = parseProjectID(projectID);
    // 如果外部传入了hit，就不再从数据库中获取hit
    hit =
      hit ||
      (await this.getHitByProjectIDShaReportID({
        projectID,
        sha,
        reportID,
      }));

    // 无论是外部hit，还是查询到的hit，都为空对象，直接返回空对象
    if (Object.keys(hit).length === 0) {
      return {};
    }

    const coverageMaps = await this.prisma.coverageMap.findMany({
      where: {
        provider,
        repoID,
        sha,
        path: filepath,
      },
    });

    // map没有也一样返回空对象
    if (coverageMaps.length === 0) {
      return {};
    }

    const { map, instrumentCwd } =
      await convertDataFromCoverageMapDatabase(coverageMaps);

    const reMapMap = await remapCoverageWithInstrumentCwd(
      resetCoverageDataMap(map),
      instrumentCwd,
    );
    return reorganizeCompleteCoverageObjects(reMapMap, hit);
  }

  private async getHitByProjectIDShaReportID({ projectID, sha, reportID }) {
    const coverages = await this.prisma.coverage.findMany({
      where: {
        projectID,
        sha,
        reportID: reportID
          ? {
              in: reportID.split(","),
            }
          : undefined,
        covType: reportID ? "agg" : "all",
      },
    });

    let hitBox = {};
    for (let i = 0; i < coverages.length; i++) {
      hitBox = mergeCoverageMap(
        hitBox,
        await decompressedData(coverages[i].hit),
      );
    }
    return hitBox;
  }
}

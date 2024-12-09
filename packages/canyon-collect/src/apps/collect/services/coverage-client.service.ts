import { HttpException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { IstanbulHitMapSchema } from "../../../zod/istanbul.zod";
import { decompressedData } from "../../../utils/zstd";
import { formatReportObject } from "../../../utils/coverage";
import { CoveragediskService } from "./core/coveragedisk.service";
import {
  formatCoverageData,
  remapCoverageWithInstrumentCwd,
  reorganizeCompleteCoverageObjects,
} from "canyon-data";

// 此代码重中之重、核心中的核心！！！
@Injectable()
export class CoverageClientService {
  constructor(
    private readonly prisma: PrismaService,
    private coveragediskService: CoveragediskService,
  ) {}
  async invoke({
    sha,
    projectID,
    coverage,
    instrumentCwd,
    reportID: _reportID,
  }) {
    const reportID = _reportID || sha;
    // #region == Step x: 检查map是否存在
    const coverageFromDatabase = await this.prisma.coverage.findFirst({
      where: {
        projectID: projectID,
        sha: sha,
        covType: "all",
      },
      select: {
        map: true,
        instrumentCwd: true,
      },
    });

    if (!coverageFromDatabase) {
      throw new HttpException("coverage map not found", 400);
    }
    // #endregion

    // #region == Step x: 解析出上报上来的覆盖率数据
    const CoverageFromExternalReport =
      typeof coverage === "string" ? JSON.parse(coverage) : coverage;
    // #endregion

    // #region == Step x: db查找出对应的map数据
    const map = await decompressedData(coverageFromDatabase.map);
    // #endregion

    // #region == Step x: 格式化上报的覆盖率对象
    const { coverage: formartCOv } = await formatReportObject({
      coverage: formatCoverageData(CoverageFromExternalReport),
      instrumentCwd: instrumentCwd,
    });

    // 未经过reMapCoverage的数据
    const originalHit = IstanbulHitMapSchema.parse(formartCOv);
    // #endregion

    // @ts-ignore
    const chongzu = reorganizeCompleteCoverageObjects(map, originalHit);

    // #region == Step x: 覆盖率回溯，在覆盖率存储之前转换(这里一定要用数据库里的instrumentCwd，因为和map是对应的！！！)
    const hit = await remapCoverageWithInstrumentCwd(
      chongzu,
      coverageFromDatabase.instrumentCwd,
    );
    // #endregion

    //   放到本地消息队列里

    await this.coveragediskService.pushQueue({
      projectID,
      sha,
      reportID,
      coverage: hit,
    });
    return {
      success: true,
    };
  }
}

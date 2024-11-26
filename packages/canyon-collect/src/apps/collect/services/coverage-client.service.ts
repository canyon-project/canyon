import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IstanbulHitMapSchema } from '../../../zod/istanbul.zod';
import { compressedData, decompressedData } from '../../../utils/zstd';
import {
  formatReportObject,
  regularData,
  remapCoverage,
} from '../../../utils/coverage';
import { genSummaryMapByCoverageMap, mergeCoverageMap } from 'canyon-data';

@Injectable()
export class CoverageClientService {
  constructor(private readonly prisma: PrismaService) {}
  async invoke({ sha, projectID, coverage, instrumentCwd }) {
    // 1. 检查是否上传map
    // coverage
    const coverageDb = await this.prisma.coverage.findFirst({
      where: {
        projectID: projectID,
        sha: sha,
        covType: 'all',
      },
    });

    if (!coverageDb) {
      throw new HttpException('coverage map not found', 400);
    }

    const coverageObject =
      typeof coverage === 'string' ? JSON.parse(coverage) : coverage;

    const coverageDbMap = await decompressedData(coverageDb.map);

    // 初始的hit是空的
    const coverageDbHit =
      coverageDb.hit.length > 0 ? await decompressedData(coverageDb.hit) : {};
    // 流程需要改一下
    // 1. 不反map
    // 2. 在消费的时候再反map

    // 测一下有map的
    // 暂时解决方案，需要解决sourceMap问题
    // ********
    // map要存，而且build时候的路径要存，不然回不去********
    // ********
    const { coverage: formartCOv } = await formatReportObject({
      coverage: regularData(coverageObject),
      instrumentCwd: instrumentCwd,
    });

    const formatCoverageHit = IstanbulHitMapSchema.parse(formartCOv);

    // ********* 合并
    const mergeCoveHit = mergeCoverageMap(coverageDbHit, formatCoverageHit);
    // *********

    // update
    // mergeCoveHit
    const hitBuffer = await compressedData(mergeCoveHit);

    // ********* 生成summary
    // 生成summary
    // ********* 生成summary

    const obj = {};

    for (const key in coverageDbMap) {
      // TODO
      if (mergeCoveHit[key]) {
        obj[key] = {
          ...coverageDbMap[key],
          ...mergeCoveHit[key],
          path: key,
        };
      }
    }
    function addInstrumentCwd(cov) {
      const o = {};
      for (const key in cov) {
        o[coverageDb.instrumentCwd + '/' + key] = {
          ...cov[key],
          path: coverageDb.instrumentCwd + '/' + key,
        };
      }
      return o;
    }
    const { coverage: mapAndHitCoverage } = await remapCoverage(
      addInstrumentCwd(obj),
    ).then((r) =>
      formatReportObject({
        coverage: r,
        instrumentCwd: coverageDb.instrumentCwd,
      }),
    );

    // 直接存summary，数组形式
    const summary = Object.entries(
      genSummaryMapByCoverageMap(mapAndHitCoverage, []),
    ).map(([key, value]) => ({
      path: key,
      ...value,
    }));

    const summaryBuffer = await compressedData(summary);

    return this.prisma.coverage.updateMany({
      where: {
        projectID: projectID,
        sha: sha,
        covType: 'all',
      },
      data: {
        hit: hitBuffer,
        summary: summaryBuffer,
      },
    });
  }
}

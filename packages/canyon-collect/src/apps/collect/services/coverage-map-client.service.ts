import { PrismaService } from '../../../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { IstanbulMapMapSchema } from '../../../zod/istanbul.zod';
import { compressedData } from '../../../utils/zstd';
import {
  formatReportObject,
  regularData,
  removeStartEndNull,
  resetCoverageData,
} from '../../../utils/coverage';
import { coverageObj } from '../models/coverage.model';

@Injectable()
export class CoverageMapClientService {
  constructor(private readonly prisma: PrismaService) {}
  async invoke({ sha, projectID, coverage, instrumentCwd, branch }) {
    // 先检查有没有
    const exist = await this.prisma.coverage.findFirst({
      where: {
        sha: sha,
        projectID: projectID,
        covType: 'all',
      },
    });

    // TODO 这里要改，需要在存在的时候更新，并且要把initMap更新一下

    if (exist) {
      return {
        id: exist.id,
        projectID: exist.projectID,
        sha: exist.sha,
      };
    }

    const coverageObject =
      typeof coverage === 'string' ? JSON.parse(coverage) : coverage;

    const { coverage: formatedCoverage } = await formatReportObject({
      coverage: resetCoverageData(regularData(coverageObject)),
      instrumentCwd: instrumentCwd,
    });

    const formatCoverageMap = IstanbulMapMapSchema.parse(
      removeStartEndNull(formatedCoverage),
    );

    const compressedFormatCoverageStr = await compressedData(formatCoverageMap);

    //   ******************************************************
    //   ******************************************************
    //   ******************************************************
    // 准备map数据
    //   ******************************************************
    //   ******************************************************
    //   ******************************************************

    return this.prisma.coverage
      .create({
        data: {
          ...coverageObj,
          branch: branch || '-',
          compareTarget: sha,
          provider: 'github',
          buildProvider: 'github',
          buildID: '',
          projectID: projectID,
          sha: sha,
          reporter: 'canyon',
          reportID: sha,
          covType: 'all', //map都是all
          statementsTotal: 0,
          statementsCovered: 0,
          //空bytes
          summary: Buffer.from([]),
          hit: Buffer.from([]),
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
    // return {};
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CoverageClientDto } from '../dto/coverage-client.dto';

@Injectable()
export class CoverageService {
  constructor(private readonly prisma: PrismaService) {}

  async getCoverageData(projectID, sha, reportID, filepath) {
    const reckoning = await this.prisma.reckoning.findMany({
      where: {
        projectID: projectID,
        sha: sha,
        reportID: reportID,
        path: filepath,
      },
    });
    const fileMap = await this.prisma.fileMap.findFirst({
      where: {
        projectID: projectID,
        sha: sha,
        path: filepath,
      },
    });
    function huanyuan(acc, cur) {
      return {
        ...acc,
        [cur.mapIndex]: cur.hits,
      };
    }
    const fileCov = JSON.parse(fileMap.mapJson);
    return {
      // ...fileCov,
      s: reckoning.filter((r) => r.dimType === 's').reduce(huanyuan, {}),
      f: reckoning.filter((r) => r.dimType === 'f').reduce(huanyuan, {}),
    };
  }
  async getCoverageSummaryMap() {
    return {};
  }
}

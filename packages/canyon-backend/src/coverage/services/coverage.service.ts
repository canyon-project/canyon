import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
// import { Project } from '../models/project.model';
// import { Project as DbProject } from '@prisma/client';
// import { AuthUser } from '../../types/AuthUser';
import { CoverageSummary } from '../models/coverage-summary';
import { genSummaryMapByCoverageMap } from '@canyon/data';
// import { getSpecificCoverageData } from '../../adapter/coverage-data.adapter';
import { CoverageDataAdapterService } from './coverage-data-adapter.service';
// import { getFileInfo } from '../../adapter/gitlab.adapter';
// import { GitlabFileInfo } from '../models/gitlab-file-info.model';
// import { Codechange } from '../models/codechange.model';

@Injectable()
export class CoverageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly coverageDataAdapterService: CoverageDataAdapterService,
  ) {}

  async getCoverageSummaryMap(
    sha: string,
    reportID: string,
    mode: string,
  ): Promise<CoverageSummary[]> {
    const coverageData = await this.getCoverageDataFromAdapter(sha, reportID);

    if (mode === 'codechange') {
      const coverages = await this.prisma.coverage.findMany({
        where: {
          sha: sha,
          covType: 'agg',
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });
      // console.log(coverages[0]);
      const codechanges = await this.prisma.codechange.findMany({
        where: {
          compareTarget: coverages[0].compareTarget,
          sha: sha,
        },
      });
      const covSummary = genSummaryMapByCoverageMap(coverageData, codechanges);
      return Object.entries(covSummary)
        .filter(([key]) =>
          codechanges.map(({ path }) => `~/${path}`).includes(key),
        )
        .map(([key, value]) => {
          return {
            path: key,
            ...value,
          };
        });
    } else {
      const covSummary = genSummaryMapByCoverageMap(coverageData, []);
      return Object.entries(covSummary).map(([key, value]) => {
        return {
          path: key,
          ...value,
        };
      });
    }
  }

  async getCoverageData(commitSha, reportID, filepath) {
    const coverageData = await this.getCoverageDataFromAdapter(
      commitSha,
      reportID,
    );
    return JSON.stringify(coverageData[filepath]);
  }

  // 私有方法
  private async getCoverageDataFromAdapter(sha, reportID) {
    const { relationID } = await this.prisma.coverage.findFirst({
      where: {
        sha: sha,
        covType: reportID === '' ? 'all' : 'agg',
        reportID: reportID === '' ? undefined : reportID,
      },
    });
    return this.coverageDataAdapterService.retrieve(relationID);
  }
}

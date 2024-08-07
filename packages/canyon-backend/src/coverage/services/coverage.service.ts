import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CoverageSummary } from '../models/coverage-summary';
import { genSummaryMapByCoverageMap } from '@canyon/data';
import { CoverageDataAdapterService } from './common/coverage-data-adapter.service';
import { TestExcludeService } from './common/test-exclude.service';

@Injectable()
export class CoverageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly coverageDataAdapterService: CoverageDataAdapterService,
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
        covType: 'agg',
        NOT:{
          projectID:{
            contains:'-ut'
          }
        }
      },
      orderBy: {
        updatedAt: 'desc',
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
    const coverageData = await this.getCoverageDataFromAdapter(
      projectID,
      commitSha,
      reportID,
    );
    return JSON.stringify(coverageData[filepath]);
  }

  // 私有方法
  private async getCoverageDataFromAdapter(projectID, sha, reportID) {
    console.log('getCoverageDataFromAdapter', projectID, sha, reportID)
    const { relationID } = await this.prisma.coverage.findFirst({
      where: {
        projectID,
        sha: sha,
        covType: reportID === '' ? 'all' : 'agg',
        reportID: reportID === '' ? undefined : reportID,
      },
    });
    return this.coverageDataAdapterService.retrieve(relationID);
  }
}

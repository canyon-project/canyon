import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CoverageSummary } from '../models/coverage-summary';
import { genSummaryMapByCoverageMap } from 'canyon-data';
import { TestExcludeService } from './common/test-exclude.service';
import { removeNullKeys } from '../../utils/utils';

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
        covType: 'agg',
        // NOT: {
        //   projectID: {
        //     contains: '-ut',
        //   },
        // },
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
    // 获取单个需要优化
    const coverageData = await this.getCoverageDataFromAdapter(
      projectID,
      commitSha,
      reportID,
      filepath,
    );
    return JSON.stringify(coverageData[filepath]);
  }

  // 私有方法
  private async getCoverageDataFromAdapter(
    projectID,
    sha,
    reportID,
    filepath = null,
  ) {
    const { id } = await this.prisma.coverage.findFirst({
      where: {
        projectID,
        sha: sha,
        covType: reportID === '' ? 'all' : 'agg',
        reportID: reportID === '' ? undefined : reportID,
      },
    });
    const promise = filepath
      ? this.prisma.covMapTest
          .findMany({
            where: removeNullKeys({
              projectID,
              sha,
              path: filepath,
            }),
            select: {
              path: true,
              mapJsonStr: true,
            },
          })
          .then((res) => {
            return res.reduce((acc, cur) => {
              acc[cur.path] = JSON.parse(cur.mapJsonStr);
              return acc;
            }, {});
          })
      : this.prisma.covMapTest
          .findMany({
            where: removeNullKeys({
              projectID,
              sha,
              path: filepath,
            }),
            select: {
              path: true,
              mapJsonStatementMapStartLine: true,
            },
          })
          .then((res) => {
            return res.reduce((acc, cur) => {
              acc[cur.path] = {
                statementMap: JSON.parse(
                  cur.mapJsonStatementMapStartLine || '{}',
                ),
              };
              return acc;
            }, {});
          });
    const maps = [
      this.prisma.covHit
        .findFirst({
          where: {
            id: `__${id}__`,
          },
        })
        .then((res) => {
          return JSON.parse(res.mapJsonStr);
        }),
      promise,
    ];

    const [hit, map] = await Promise.all(maps);
    const obj = {};

    Object.entries(hit).forEach(([key, value]: any) => {
      if (map[key]) {
        obj[key] = {
          path: key,
          ...value,
          ...map[key],
        };
      }
    });

    return obj;
  }
}

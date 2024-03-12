import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as dayjs from 'dayjs';
// import { calculateCoverageOverviewByConditionFilter } from '../../utils/summary';
import { percent, removeNullKeys } from '../../utils/utils';

@Injectable()
export class GetProjectCompartmentDataService {
  constructor(private readonly prisma: PrismaService) {}
  async invoke(projectID) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectID,
      },
    });
    const coverages = await this.prisma.coverage.findMany({
      where: removeNullKeys({
        projectID: projectID,
        covType: 'all',
        branch: ['', '-'].includes(project.defaultBranch)
          ? null
          : project.defaultBranch,
      }),
      orderBy: {
        createdAt: 'desc',
      },
    });
    const summarys = await this.prisma.summary.findMany({
      where: {
        covType: 'all',
        sha: {
          in: [...new Set(coverages.map((item) => item.sha))],
        },
      },
    });

    // 最新一次上报

    const lastCoverage = coverages[0];

    const lastCoverageSummary = summarys.find(
      (item) =>
        item.sha === lastCoverage.sha && item.metricType === 'statements',
    ) || { covered: 0, total: 0 };

    const lastCoverageStatements = percent(
      lastCoverageSummary.covered,
      lastCoverageSummary.total,
    );
    // 获取 30 天前的日期
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 上报的最大值
    const maxs = coverages
      .filter((i) => new Date(i.createdAt) >= thirtyDaysAgo)
      .map((coverage) => {
        const summary = summarys.find(
          (item) =>
            item.sha === coverage.sha && item.metricType === 'statements',
        ) || { covered: 0, total: 0 };
        const max =
          (summary?.total || 0) === 0
            ? 0
            : percent(summary.covered, summary.total);
        return max;
      });

    const max = Math.max(...maxs);
    return [
      {
        label: 'projects.total_times',
        value: String(coverages.length),
      },
      {
        label: 'projects.max_coverage',
        value: max > 0 ? max.toFixed(2) + '%' : '0%',
      },
      {
        label: 'projects.latest_report_time',
        value: dayjs(
          coverages.length > 0 ? coverages[0].createdAt : new Date(),
        ).format('MM-DD HH:mm'),
      },
      {
        label: 'projects.latest_report_coverage',
        value: lastCoverageStatements.toFixed(2) + '%',
      },
    ];
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as dayjs from 'dayjs';
// import { calculateCoverageOverviewByConditionFilter } from '../../utils/summary';
import { percent } from '../../utils/utils';

@Injectable()
export class GetProjectCompartmentDataService {
  constructor(private readonly prisma: PrismaService) {}
  async invoke(projectID) {
    const coverages = await this.prisma.coverage.findMany({
      where: {
        projectID: projectID,
        covType: 'all',
      },
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
    );

    const lastCoverageStatements = percent(
      lastCoverageSummary.covered,
      lastCoverageSummary.total,
    );

    // 上报的最大值
    const maxs = coverages.map((coverage) => {
      const summary = summarys.find(
        (item) => item.sha === coverage.sha && item.metricType === 'statements',
      );
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
        value: max.toFixed(2) + '%',
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

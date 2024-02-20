import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
@Injectable()
export class GetProjectsService {
  constructor(private readonly prisma: PrismaService) {}
  async invoke(current, pageSize, keyword, bu, field, order): Promise<any> {
    // 2.根据项目ID再查询到对应的项目信息，使用promise.all
    const whereCondition: any = {
      OR: [
        {
          pathWithNamespace: {
            contains: keyword,
          },
        },
        {
          id: {
            contains: keyword,
          },
        },
      ],
    };

    if (bu.length > 0) {
      whereCondition.bu = {
        in: bu,
      };
    }
    const total = await this.prisma.project.findMany({
      select: {
        id: true,
        bu: true,
      },
      where: whereCondition,
    });
    // 1.排序分页查询IDs
    const projectIDs = await (() => {
      if (field === 'maxCoverage') {
        return this.preQuerySortPagingByMaxCoverage(
          current,
          pageSize,
          keyword,
          bu,
          field,
          order,
          total,
        );
      }
      if (field === 'reportTimes') {
        return this.preQuerySortPagingByReportTimes(
          current,
          pageSize,
          keyword,
          bu,
          field,
          order,
          total,
        );
      }
      if (field === 'lastReportTime') {
        return this.preQuerySortPagingByLastReportTime(
          current,
          pageSize,
          keyword,
          bu,
          field,
          order,
          total,
        );
      }
      if (field === 'bu') {
        return this.prisma.project
          .findMany({
            where: whereCondition,
            select: {
              id: true,
            },
            orderBy: {
              bu: { ascend: 'asc', descend: 'desc' }[order] || 'desc',
            },
            skip: (current - 1) * pageSize,
            take: pageSize,
          })
          .then((res) => {
            return res.map((item) => item.id);
          });
      }
      // 默认按照最后一次上报时间排序
      return this.preQuerySortPagingByLastReportTime(
        current,
        pageSize,
        keyword,
        bu,
        field,
        order,
        total,
      );
    })();

    const rows = await Promise.all(
      projectIDs.map(async (id) => {
        // 1.获取所有sha
        const shas = await this.prisma.coverage.findMany({
          where: {
            projectID: id,
            covType: 'all',
          },
          select: {
            sha: true,
          },
        });

        const summarys = await this.prisma.summary.findMany({
          where: {
            covType: 'all',
            metricType: 'statements',
            sha: {
              in: shas.map((item) => item.sha),
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        const project = await this.prisma.project.findFirst({
          where: {
            id: id,
          },
        });

        const maxCoverage = await this.prisma.$queryRaw`
        SELECT
            ROUND(MAX(100 * COALESCE(covered::decimal, 0) / NULLIF(total, 0)), 2) AS max_coverage_percentage
        FROM
            Summary
        WHERE
            sha IN (${Prisma.join((shas.length > 0 ? shas : ['null']).map((item) => item.sha))})
            AND metric_type = 'statements'
            AND cov_type = 'all'
            AND created_at >= NOW() - INTERVAL '30 days'
        ORDER BY
            max_coverage_percentage DESC
    `.then((res: any) => {
          return (res.length > 0 ? res[0].max_coverage_percentage : 0) || 0;
        });

        return {
          id: id,
          bu: project.bu,
          lastReportTime:
            summarys.length > 0
              ? summarys[0].createdAt
              : new Date('1970-01-01'),
          maxCoverage: maxCoverage,
          reportTimes: [...new Set(summarys.map(({ sha }) => sha))].length,
          pathWithNamespace: project.pathWithNamespace,
        };
      }),
    );

    // Now 'rows' will contain the data you need.

    return {
      data: rows,
      total: total.length,
    };
  }

  async preQuerySortPagingByMaxCoverage(
    current,
    pageSize,
    keyword,
    bu,
    field,
    order,
    total,
  ) {
    const limit = pageSize; // pageSize控制每页的记录数
    const offset = (current - 1) * pageSize; // 计算要跳过的记录数

    return await this.prisma.$queryRaw`
WITH ProjectCoverages AS (
    SELECT
        p.id AS project_id,
        COALESCE(MAX(100*COALESCE(s.covered::decimal, 0) / NULLIF(s.total, 0)), 0) AS coverage_percentage
    FROM
        Project p
    LEFT JOIN
        Coverage c ON p.id = c.project_id
    LEFT JOIN
        Summary s ON c.sha = s.sha AND c.report_id = s.report_id AND s.metric_type = 'statements' AND s.cov_type = 'all' AND s.created_at >= NOW() - INTERVAL '30 days'
    WHERE p.id IN (${Prisma.join(total.map(({ id }) => id))}) AND (p.path_with_namespace ILIKE ${'%' + keyword + '%'} OR p.id ILIKE ${'%' + keyword + '%'})
    GROUP BY
        p.id, p.name, p.bu
)
SELECT
    project_id,
    ROUND(coverage_percentage, 2) AS coverage_percentage
FROM
    ProjectCoverages
ORDER BY
    coverage_percentage ${Prisma.sql([{ ascend: 'ASC', descend: 'DESC' }[order] || 'DESC'])}
LIMIT
    ${limit} OFFSET ${offset};
`.then((res: any) => {
      return res.map((item) => {
        return item.project_id;
      });
    });
  }

  async preQuerySortPagingByReportTimes(
    current,
    pageSize,
    keyword,
    bu,
    field,
    order,
    total,
  ) {
    const limit = pageSize; // pageSize控制每页的记录数
    const offset = (current - 1) * pageSize; // 计算要跳过的记录数

    return await this.prisma.$queryRaw`
    WITH ProjectReportCounts AS (
    SELECT
        p.id AS project_id,
        CAST(COUNT(DISTINCT c.sha) AS INT) AS report_times
    FROM
        Project p
    LEFT JOIN
        Coverage c ON p.id = c.project_id
    LEFT JOIN
        Summary s ON c.sha = s.sha AND c.report_id = s.report_id AND s.metric_type = 'statements' AND s.cov_type = 'all' AND s.created_at >= NOW() - INTERVAL '30 days'
    WHERE p.id IN (${Prisma.join(total.map(({ id }) => id))}) AND (p.path_with_namespace ILIKE ${'%' + keyword + '%'} OR p.id ILIKE ${'%' + keyword + '%'})
    GROUP BY
        p.id
)
SELECT
    project_id,
    COALESCE(report_times, 0) AS report_times
FROM
    ProjectReportCounts
ORDER BY
    report_times ${Prisma.sql([{ ascend: 'ASC', descend: 'DESC' }[order] || 'DESC'])}
LIMIT
    ${limit} OFFSET ${offset};
    `.then((res: any) => {
      return res.map((item) => {
        return item.project_id;
      });
    });
  }

  async preQuerySortPagingByLastReportTime(
    current,
    pageSize,
    keyword,
    bu,
    field,
    order,
    total,
  ) {
    const limit = pageSize; // pageSize控制每页的记录数
    const offset = (current - 1) * pageSize; // 计算要跳过的记录数

    return await this.prisma.$queryRaw`
    WITH ProjectReportCounts AS (
    SELECT
        p.id AS project_id,
        MAX(s.created_at) AS last_report_time
    FROM
        Project p
    LEFT JOIN
        Coverage c ON p.id = c.project_id
    LEFT JOIN
        Summary s ON c.sha = s.sha AND c.report_id = s.report_id AND s.metric_type = 'statements' AND s.cov_type = 'all'
    WHERE p.id IN (${Prisma.join(total.map(({ id }) => id))}) AND (p.path_with_namespace ILIKE ${'%' + keyword + '%'} OR p.id ILIKE ${'%' + keyword + '%'})
    GROUP BY
        p.id
)
SELECT
    project_id,
    COALESCE(last_report_time, '1970-01-01') AS last_report_time
FROM
    ProjectReportCounts
ORDER BY
    last_report_time ${Prisma.sql([{ ascend: 'ASC', descend: 'DESC' }[order] || 'DESC'])}
LIMIT
    ${limit} OFFSET ${offset};
    `.then((res: any) => {
      return res.map((item) => {
        return item.project_id;
      });
    });
  }
}

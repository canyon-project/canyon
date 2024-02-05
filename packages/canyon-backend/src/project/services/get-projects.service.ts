import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
function underscoreToCamelCase(string) {
  return string.replace(/_([a-z])/g, function (match, letter) {
    return letter.toUpperCase();
  });
}
function camelCaseToUnderscore(string) {
  return string.replace(/([A-Z])/g, '_$1').toLowerCase();
}
@Injectable()
export class GetProjectsService {
  constructor(private readonly prisma: PrismaService) {}
  async invoke(current, pageSize, keyword, _bu, field, order) {
    const bu =
      _bu.length > 0
        ? _bu
        : await this.prisma.project
            .groupBy({
              by: ['bu'],
              _count: {
                bu: true,
              },
            })
            .then((r) => r.map((item) => item.bu));

    const limit = pageSize; // pageSize控制每页的记录数
    const offset = (current - 1) * pageSize; // 计算要跳过的记录数

    const total: any = await this.prisma.$queryRaw`
    SELECT COUNT(DISTINCT p.id) AS total
FROM project_20240130 AS p
LEFT JOIN coverage_20240130 AS c ON p.id = c.project_id
LEFT JOIN summary_20240130 AS s ON c.sha = s.sha and c.report_id=s.report_id
WHERE s.metric_type='statements' AND s.cov_type='all' AND bu IN (${Prisma.join(bu)}) AND (p.path_with_namespace ILIKE ${'%' + keyword + '%'} OR p.id ILIKE ${'%' + keyword + '%'})
GROUP BY p.id
    `.then((r: any) => r.length);

    const rows: any[] = await this.prisma.$queryRaw`
SELECT p.id AS id, p.path_with_namespace,p.description,p.name, CAST(COUNT(DISTINCT c.sha) AS INT) AS report_times,p.bu, ROUND(MAX(100*covered::decimal / NULLIF(total, 0)),2) AS max_coverage, MAX(s.created_at) AS last_report_time
FROM project_20240130 AS p
LEFT JOIN coverage_20240130 AS c ON p.id = c.project_id
LEFT JOIN summary_20240130 AS s ON c.sha = s.sha and c.report_id=s.report_id
WHERE s.metric_type='statements' AND s.cov_type='all' AND bu IN (${Prisma.join(bu)}) AND (p.path_with_namespace ILIKE ${'%' + keyword + '%'} OR p.id ILIKE ${'%' + keyword + '%'})
GROUP BY p.id
ORDER BY ${Prisma.sql([camelCaseToUnderscore(field) || 'last_report_time'])} ${Prisma.sql([{ ascend: 'ASC', descend: 'DESC' }[order] || 'DESC'])}
LIMIT ${limit} OFFSET ${offset};
`;

    return {
      data: rows.map((item: any) => {
        return Object.keys(item).reduce((acc, key) => {
          acc[underscoreToCamelCase(key)] = item[key];
          return acc;
        }, {});
      }),
      total: total,
    };
  }
}

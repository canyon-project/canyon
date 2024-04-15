import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { percent } from '../../utils/utils';
@Injectable()
export class GetProjectRecordDetailByShaService {
  constructor(private readonly prisma: PrismaService) {}
  async invoke(projectID, sha): Promise<any> {
    const current = 1;
    const pageSize = 200;
    const coverages = await this.prisma.coverage.findMany({
      where: {
        projectID,
        sha,
        covType: 'agg',
      },
      skip: (current - 1) * pageSize,
      take: pageSize,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const users = await this.prisma.user.findMany({
      where: {},
    });
    const rows = [];

    for (let i = 0; i < coverages.length; i++) {
      const coverage = coverages[i];
      const data = {
        ...coverage,
        relationID: '',
        compareUrl: '',
        webUrl: '',
        newlines: coverage.summary['newlines']['pct'],
        statements: coverage.summary['statements']['pct'],
        lastReportTime: coverage.updatedAt,
        times: 0,
        logs: [],
        message: '',
        reporterUsername: users.find(({ id: uId }) => {
          return String(uId) === coverage.reporter;
        })?.nickname,
        reporterAvatar: users.find(
          ({ id: uId }) => String(uId) === coverage.reporter,
        )?.avatar,
      };
      rows.push(data);
    }
    return rows;
  }
}

//get-project-record-detail-by-sha.service.ts

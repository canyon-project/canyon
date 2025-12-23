import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CoverageCommitsService {
  constructor(private readonly prisma: PrismaService) {}

  async findCommits(queryDto: {
    repoID: string;
    search?: string;
    defaultBranch?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = queryDto.page || 1;
    const pageSize = queryDto.pageSize || 10;
    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where: any = {
      repoID: queryDto.repoID,
    };

    // 搜索条件：支持 sha、branches、reportID 模糊搜索
    if (queryDto.search) {
      where.OR = [
        {
          sha: {
            contains: queryDto.search,
          },
        },
        {
          branches: {
            contains: queryDto.search,
          },
        },
        {
          reportID: {
            contains: queryDto.search,
          },
        },
      ];
    }

    // 默认分支筛选
    if (queryDto.defaultBranch) {
      where.branches = {
        contains: queryDto.defaultBranch,
      };
    }

    // 先查询所有符合条件的记录
    const allRecords = await this.prisma.coverage.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 按 sha 分组，获取每个 commit 的最新记录和统计信息
    const commitsMap = new Map<
      string,
      {
        sha: string;
        branches: string[];
        reportIDs: string[];
        reportProviders: string[];
        buildTargets: string[];
        versionIDs: string[];
        coverageIDs: string[];
        latestCreatedAt: Date;
        count: number;
        compareTarget?: string; // 可以从其他字段获取
      }
    >();

    allRecords.forEach((record) => {
      const existing = commitsMap.get(record.sha);
      if (!existing) {
        commitsMap.set(record.sha, {
          sha: record.sha,
          branches: record.branches ? [record.branches] : [],
          reportIDs: [record.reportID],
          reportProviders: [record.reportProvider],
          buildTargets: record.buildTarget ? [record.buildTarget] : [],
          versionIDs: [record.versionID],
          coverageIDs: [record.id],
          latestCreatedAt: record.createdAt,
          count: 1,
        });
      } else {
        // 更新统计信息
        if (record.branches && !existing.branches.includes(record.branches)) {
          existing.branches.push(record.branches);
        }
        if (!existing.reportIDs.includes(record.reportID)) {
          existing.reportIDs.push(record.reportID);
        }
        if (!existing.reportProviders.includes(record.reportProvider)) {
          existing.reportProviders.push(record.reportProvider);
        }
        if (
          record.buildTarget &&
          !existing.buildTargets.includes(record.buildTarget)
        ) {
          existing.buildTargets.push(record.buildTarget);
        }
        if (!existing.versionIDs.includes(record.versionID)) {
          existing.versionIDs.push(record.versionID);
        }
        if (!existing.coverageIDs.includes(record.id)) {
          existing.coverageIDs.push(record.id);
        }
        if (record.createdAt > existing.latestCreatedAt) {
          existing.latestCreatedAt = record.createdAt;
        }
        existing.count += 1;
      }
    });

    // 转换为数组并排序
    const commits = Array.from(commitsMap.values()).sort(
      (a, b) => b.latestCreatedAt.getTime() - a.latestCreatedAt.getTime(),
    );

    // 分页
    const total = commits.length;
    const paginatedCommits = commits.slice(skip, skip + pageSize);

    // 获取每个 commit 的最新记录详情
    const result = await Promise.all(
      paginatedCommits.map(async (commit) => {
        // 获取该 sha 的最新记录
        const latestRecord = await this.prisma.coverage.findFirst({
          where: {
            repoID: queryDto.repoID,
            sha: commit.sha,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        return {
          sha: commit.sha,
          branch: commit.branches[0] || '',
          compareTarget: latestRecord?.branches || '', // 可以从其他字段获取对比目标
          commitMessage: '', // 需要从 Git API 获取，暂时为空
          statements: 0, // 需要从覆盖率数据计算，暂时为 0
          newLines: 0, // 需要从覆盖率数据计算，暂时为 0
          times: commit.count,
          latestReport: commit.latestCreatedAt.toISOString(),
          buildTarget: commit.buildTargets.join(', ') || '',
          versionID: commit.versionIDs[0] || '',
          coverageID: commit.coverageIDs[0] || '',
          reportID: commit.reportIDs[0] || '',
          reportProvider: commit.reportProviders[0] || '',
        };
      }),
    );

    return {
      data: result,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}

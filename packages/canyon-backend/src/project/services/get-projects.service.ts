import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Project } from '../project.model';
import { percent } from '../../utils/utils';
import { getProjectByID } from 'src/adapter/gitlab.adapter';
// import { getProjectByID } from '../adapter/gitlab.adapter';
function parseGitLabUrl(gitLabUrl) {
  // 匹配 GitLab URL 的正则表达式
  const gitLabRegex = /^(?:https?:\/\/)?([^\/]+)\/(.+)$/;

  // 尝试匹配正则表达式
  const match = gitLabUrl.match(gitLabRegex);

  if (match) {
    // 提取匹配的组和仓库名
    const groupAndRepo = match[2].split('/');
    const groupName = groupAndRepo.slice(0, -1).join('/');
    const repositoryName = groupAndRepo.slice(-1)[0];
    return { groupName, repositoryName };
  } else {
    // 如果没有匹配到，返回 null
    return { groupName: null, repositoryName: null };
  }
}

@Injectable()
export class GetProjectsService {
  constructor(private readonly prisma: PrismaService) {}
  async invoke(current, pageSize, keyword, bu) {
    const whereCondition: any = {
      OR: [
        // { description: { contains: keyword } },
        // { name: { contains: keyword } },
        { pathWithNamespace: { contains: keyword, mode: 'insensitive' } },
        { id: { contains: keyword, mode: 'insensitive' } },
      ],
    };

    if (bu.length > 0) {
      whereCondition['bu'] = { in: bu };
    }
    const total = await this.prisma.project.count({
      where: whereCondition,
    });

    const projects = await this.prisma.project.findMany({
      where: whereCondition,
      skip: (current - 1) * pageSize,
      take: pageSize - 0,
    });

    const rows = [];

    for (let i = 0; i < projects.length; i++) {
      const coverages = await this.prisma.coverage.findMany({
        where: {
          projectID: projects[i].id,
          covType: 'all',
        },
      });

      const summarys = await this.prisma.summary.findMany({
        where: {
          // projectID: projects[i].id,
          covType: 'all',
          metricType: 'statements',
          sha: {
            in: [...new Set(coverages.map((item) => item.sha))],
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      if (summarys.length > 0) {
        rows.push({
          ...projects[i],
          lastReportTime: summarys[0]?.createdAt,
          reportTimes: summarys.length,
          maxCoverage: Math.max(
            ...summarys.map((item) =>
              item.total === 0 ? 0 : percent(item.covered, item.total),
            ),
          ),
        });
      } else {
        rows.push({
          ...projects[i],
          lastReportTime: new Date(),
          reportTimes: 0,
          maxCoverage: 0,
        });
      }
    }
    return {
      data: rows,
      total,
    };
  }
}

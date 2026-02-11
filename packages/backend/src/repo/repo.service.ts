import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createScmAdapter } from '../scm';
import type { ScmConfig } from '../scm';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRepoDto } from './dto/create-repo.dto';
import { QueryRepoDto } from './dto/query-repo.dto';
import { UpdateRepoDto } from './dto/update-repo.dto';

@Injectable()
export class RepoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private getScmConfig(provider: string): ScmConfig {
    if (provider === 'gitlab') {
      const base = this.config.get('INFRA.GITLAB_BASE_URL');
      const token = this.config.get('INFRA.GITLAB_PRIVATE_TOKEN');
      if (!base || !token) throw new BadRequestException('GitLab 配置缺失');
      return { type: 'gitlab', base, token };
    }
    if (provider === 'github') {
      const token = this.config.get('INFRA.GITHUB_PRIVATE_TOKEN');
      if (!token) throw new BadRequestException('GitHub 配置缺失');
      return { type: 'github', token };
    }
    throw new BadRequestException(`不支持的 provider: ${provider}`);
  }

  /**
   * 通过 SCM 适配器获取 pathWithNamespace
   */
  private async fetchPathWithNamespace(
    provider: string,
    repoID: string,
  ): Promise<string> {
    try {
      const config = this.getScmConfig(provider);
      const scm = createScmAdapter(config);
      const info = await scm.getRepoInfo(repoID.trim());
      return info.pathWithNamespace;
    } catch (err: unknown) {
      if (err instanceof BadRequestException) throw err;
      const msg =
        err instanceof Error ? err.message : '获取仓库信息失败';
      throw new BadRequestException(msg);
    }
  }

  /**
   * 检查仓库：通过 SCM 适配器返回 repoID、pathWithNamespace、description
   */
  async checkRepo(
    provider: string,
    repoID: string,
  ): Promise<{ repoID: string; pathWithNamespace: string; description: string }> {
    const id = repoID.trim();
    try {
      const config = this.getScmConfig(provider);
      const scm = createScmAdapter(config);
      const info = await scm.getRepoInfo(id);
      return {
        repoID: id,
        pathWithNamespace: info.pathWithNamespace,
        description: info.description ?? '',
      };
    } catch (err: unknown) {
      if (err instanceof BadRequestException) throw err;
      const msg =
        err instanceof Error ? err.message : '获取仓库信息失败';
      throw new BadRequestException(msg);
    }
  }

  async findAll(queryDto?: QueryRepoDto) {
    // 构建查询条件
    const where: any = {};

    // Bu 筛选
    if (queryDto?.bu) {
      where.bu = queryDto.bu;
    }

    // 搜索条件：支持 repoID 和 pathWithNamespace 模糊搜索
    if (queryDto?.search) {
      where.OR = [
        {
          id: {
            contains: queryDto.search,
          },
        },
        {
          pathWithNamespace: {
            contains: queryDto.search,
          },
        },
      ];
    }

    const rows = await this.prisma.repo.findMany({
      where,
    });

    // 获取所有仓库的 ID
    const repoIds = rows.map((r) => r.id);

    // 批量查询每个仓库的报告统计信息
    const coverageStats = await this.prisma.coverage.groupBy({
      by: ['repoID'],
      where: {
        repoID: {
          in: repoIds,
        },
      },
      _count: {
        id: true,
      },
      _max: {
        createdAt: true,
      },
    });

    // 将统计信息转换为 Map，方便查找
    const statsMap = new Map(
      coverageStats.map((stat) => [
        stat.repoID,
        {
          count: stat._count.id,
          lastReportTime: stat._max.createdAt,
        },
      ]),
    );

    // 合并数据并添加统计信息
    const reposWithStats = rows.map((r) => {
      const stats = statsMap.get(r.id);
      return {
        ...r,
        // Prisma Json -> JSON string for API response
        tags: JSON.stringify(r.tags ?? null),
        members: JSON.stringify(r.members ?? null),
        // 添加统计信息
        reportTimes: stats?.count || 0,
        lastReportTime: stats?.lastReportTime || null,
      };
    });

    // 按照最新上报时间排序，最近的排在前面（null 值排在最后）
    reposWithStats.sort((a, b) => {
      // 如果两个都有 lastReportTime，按时间降序排序
      if (a.lastReportTime && b.lastReportTime) {
        return (
          new Date(b.lastReportTime).getTime() -
          new Date(a.lastReportTime).getTime()
        );
      }
      // 如果只有 a 有，a 排在前面
      if (a.lastReportTime && !b.lastReportTime) {
        return -1;
      }
      // 如果只有 b 有，b 排在前面
      if (!a.lastReportTime && b.lastReportTime) {
        return 1;
      }
      // 如果都没有，按 updatedAt 降序排序
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return reposWithStats;
  }

  async findAllBu() {
    const distinctBu = await this.prisma.repo.findMany({
      select: {
        bu: true,
      },
      distinct: ['bu'],
      where: {
        bu: {
          not: '',
        },
      },
      orderBy: {
        bu: 'asc',
      },
    });

    return distinctBu.map((item) => item.bu).filter((bu) => bu);
  }

  async findOne(id: string) {
    let repo;
    if (id.includes('/')) {
      repo = await this.prisma.repo.findFirst({
        where: { pathWithNamespace: id },
      });
    } else {
      repo = await this.prisma.repo.findUnique({ where: { id } });
    }

    if (!repo) {
      throw new NotFoundException(`Repo with id ${id} not found`);
    }

    return {
      ...repo,
      tags: JSON.stringify(repo.tags ?? null),
      members: JSON.stringify(repo.members ?? null),
    };
  }

  async create(createRepoDto: CreateRepoDto) {
    const pathWithNamespace = await this.fetchPathWithNamespace(
      createRepoDto.provider,
      createRepoDto.repoID,
    );
    const id = `${createRepoDto.provider}-${createRepoDto.repoID}`;
    const now = new Date();
    try {
      const created = await this.prisma.repo.create({
        data: {
          id,
          pathWithNamespace,
          description: '-',
          config: '{}',
          bu: '',
          tags: [],
          members: [],
          provider: createRepoDto.provider,
          createdAt: now,
          updatedAt: now,
        },
      });
      return {
        ...created,
        tags: JSON.stringify(created.tags ?? null),
        members: JSON.stringify(created.members ?? null),
      };
    } catch (err: unknown) {
      const prismaErr = err as { code?: string };
      if (prismaErr?.code === 'P2002') {
        throw new ConflictException('仓库已存在（id 重复）');
      }
      throw err;
    }
  }

  async update(id: string, updateRepoDto: UpdateRepoDto) {
    const updated = await this.prisma.repo.update({
      where: { id },
      data: {
        pathWithNamespace: updateRepoDto.pathWithNamespace ?? undefined,
        description: updateRepoDto.description ?? undefined,
        bu: updateRepoDto.bu ?? undefined,
        tags:
          updateRepoDto.tags !== undefined
            ? JSON.parse(updateRepoDto.tags)
            : undefined,
        members:
          updateRepoDto.members !== undefined
            ? JSON.parse(updateRepoDto.members)
            : undefined,
        config: updateRepoDto.config ?? undefined,
        provider: updateRepoDto.provider ?? undefined,
        updatedAt: new Date(),
      },
    });
    return {
      ...updated,
      tags: JSON.stringify(updated.tags ?? null),
      members: JSON.stringify(updated.members ?? null),
    };
  }

  async remove(id: string) {
    const deleted = await this.prisma.repo.delete({ where: { id } });
    return {
      ...deleted,
      tags: JSON.stringify(deleted.tags ?? null),
      members: JSON.stringify(deleted.members ?? null),
    };
  }
}

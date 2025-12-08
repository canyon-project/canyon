import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRepoInput, UpdateRepoInput } from './input-type.args';

@Injectable()
export class RepoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async list() {
    const rows = await this.prisma.repo.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map((r) => ({
      ...r,
      // Prisma Json -> GraphQL string
      tags: JSON.stringify(r.tags ?? null),
      members: JSON.stringify(r.members ?? null),
    }));
  }

  async get(id: string) {
    if (id.includes('/')) {
      const r = await this.prisma.repo.findFirst({
        where: { pathWithNamespace: id },
      });
      if (!r) return null as unknown as undefined;
      return {
        ...r,
        tags: JSON.stringify(r.tags ?? null),
        members: JSON.stringify(r.members ?? null),
      };
    } else {
      id = id.split('-')[1]; // 兼容带后缀的 ID
      const r = await this.prisma.repo.findUnique({ where: { id } });
      return r;
    }
  }

  async create(input: CreateRepoInput) {
    const created = await this.prisma.repo.create({
      data: {
        id: input.id,
        // name: input.name,
        pathWithNamespace: input.pathWithNamespace,
        description: input.description,
        // bu: input.bu,
        tags: input.tags ? JSON.parse(input.tags) : undefined,
        members: input.members ? JSON.parse(input.members) : undefined,
        config: input.config,
        bu: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return {
      ...created,
      tags: JSON.stringify(created.tags ?? null),
      members: JSON.stringify(created.members ?? null),
    };
  }

  async update(id: string, input: UpdateRepoInput) {
    const updated = await this.prisma.repo.update({
      where: { id },
      data: {
        // name: input.name ?? undefined,
        pathWithNamespace: input.pathWithNamespace ?? undefined,
        description: input.description ?? undefined,
        // bu: input.bu ?? undefined,
        tags: input.tags !== undefined ? JSON.parse(input.tags) : undefined,
        members:
          input.members !== undefined ? JSON.parse(input.members) : undefined,
        config: input.config ?? undefined,
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

  async createFromGitlab(params: { provider?: string; repoID?: string }) {
    // 从 GitLab API 获取仓库信息
    const base = await this.configService.get('INFRA.GITLAB_BASE_URL');
    const token = await this.configService.get('INFRA.GITLAB_PRIVATE_TOKEN');

    if (!token) {
      throw new Error('GITLAB_TOKEN environment variable is not set');
    }

    // URL encode the project path
    const encodedPath = params?.repoID || '';

    try {
      const response = await axios.get(
        `${base}/api/v4/projects/${encodedPath}`,
        {
          headers: {
            'PRIVATE-TOKEN': token,
          },
        },
      );

      const gitlabProject = response.data;

      // 生成 ID
      const id = params.repoID || String(gitlabProject.id);

      // 检查是否已存在
      const existing = await this.prisma.repo.findUnique({ where: { id } });
      if (existing) {
        throw new Error(`Repository with id ${id} already exists`);
      }

      // 创建仓库记录
      const created = await this.prisma.repo.create({
        data: {
          id,
          pathWithNamespace: gitlabProject.path_with_namespace,
          description: gitlabProject.description || '',
          bu: gitlabProject.bu || '',
          tags: [],
          members: [],
          config: '{}',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return {
        ...created,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error(`GitLab project ${'pathWithNamespace'} not found`);
        }
        throw new Error(
          `GitLab API error: ${error.response?.data?.message || error.message}`,
        );
      }
      throw error;
    }
  }
}

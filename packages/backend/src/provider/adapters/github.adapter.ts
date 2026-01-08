import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { IProviderAdapter } from '../interfaces/provider-adapter.interface';

@Injectable()
export class GitHubAdapter implements IProviderAdapter {
  constructor(private readonly configService: ConfigService) {}

  private async getAxiosInstance(): Promise<AxiosInstance> {
    const base = 'https://api.github.com';
    const token = await this.configService.get('INFRA.GITHUB_PRIVATE_TOKEN');

    if (!token) {
      throw new BadRequestException('GitHub 配置缺失');
    }

    return axios.create({
      baseURL: base,
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
  }

  /**
   * 解析 GitHub 项目 ID 为 owner/repo 格式
   */
  private async resolveProjectId(projectId: string): Promise<{
    owner: string;
    repo: string;
  }> {
    const axiosInstance = await this.getAxiosInstance();

    // 如果已经是 owner/repo 格式，直接返回
    if (projectId.includes('/')) {
      const [owner, repo] = projectId.split('/');
      if (!owner || !repo) {
        throw new BadRequestException('GitHub repoID 格式错误');
      }
      return { owner, repo };
    }

    // 如果是数字 ID，通过 API 解析
    if (/^[0-9]+$/.test(projectId)) {
      try {
        const response = await axiosInstance.get(
          `/repositories/${encodeURIComponent(projectId)}`,
        );
        const data = response.data;
        const fullName = data.full_name;
        if (fullName && fullName.includes('/')) {
          const [owner, repo] = fullName.split('/');
          return { owner, repo };
        }
        const owner = data.owner?.login;
        const repo = data.name;
        if (!owner || !repo) {
          throw new BadRequestException('GitHub 仓库信息不完整');
        }
        return { owner, repo };
      } catch (error: any) {
        throw new BadRequestException('无法解析 GitHub 仓库 ID');
      }
    }

    throw new BadRequestException('GitHub repoID 需为 owner/repo 或数字 ID');
  }

  async compareCommits(
    projectId: string,
    from: string,
    to: string,
  ): Promise<any> {
    try {
      const axiosInstance = await this.getAxiosInstance();
      const { owner, repo } = await this.resolveProjectId(projectId);
      const response = await axiosInstance.get(
        `/repos/${owner}/${repo}/compare/${from}...${to}`,
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new BadRequestException(
          `GitHub API 错误: ${error.response.status} - ${error.response.statusText}`,
        );
      }
      throw new BadRequestException(`GitHub 请求失败: ${error.message}`);
    }
  }

  async getRepository(projectId: string): Promise<any> {
    try {
      const axiosInstance = await this.getAxiosInstance();
      const { owner, repo } = await this.resolveProjectId(projectId);
      const response = await axiosInstance.get(`/repos/${owner}/${repo}`);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new BadRequestException(
          `GitHub API 错误: ${error.response.status} - ${error.response.statusText}`,
        );
      }
      throw new BadRequestException(`GitHub 请求失败: ${error.message}`);
    }
  }
}

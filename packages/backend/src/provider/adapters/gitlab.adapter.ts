import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { IProviderAdapter } from '../interfaces/provider-adapter.interface';

@Injectable()
export class GitLabAdapter implements IProviderAdapter {
  constructor(private readonly configService: ConfigService) {}

  private async getAxiosInstance(): Promise<AxiosInstance> {
    const base = await this.configService.get('INFRA.GITLAB_BASE_URL');
    const token = await this.configService.get('INFRA.GITLAB_PRIVATE_TOKEN');

    if (!base || !token) {
      throw new BadRequestException('GitLab 配置缺失');
    }
    return axios.create({
      baseURL: base,
      headers: {
        'PRIVATE-TOKEN': token,
      },
    });
  }

  async compareCommits(
    projectId: string,
    from: string,
    to: string,
  ): Promise<any> {
    try {
      const axiosInstance = await this.getAxiosInstance();
      const encodedProjectId = encodeURIComponent(projectId);
      const response = await axiosInstance.get(
        `/api/v4/projects/${encodedProjectId}/repository/compare`,
        {
          params: {
            from,
            to,
          },
        },
      );
      console.log('response', response.data);
      return response.data;
    } catch (error: any) {
      console.log('error', error);
      if (error.response) {
        throw new BadRequestException(
          `GitLab API 错误: ${error.response.status} - ${error.response.statusText}`,
        );
      }
      throw new BadRequestException(`GitLab 请求失败: ${error.message}`);
    }
  }

  async getRepository(projectId: string): Promise<any> {
    try {
      const axiosInstance = await this.getAxiosInstance();
      const encodedProjectId = encodeURIComponent(projectId);
      const response = await axiosInstance.get(
        `/api/v4/projects/${encodedProjectId}`,
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new BadRequestException(
          `GitLab API 错误: ${error.response.status} - ${error.response.statusText}`,
        );
      }
      throw new BadRequestException(`GitLab 请求失败: ${error.message}`);
    }
  }
}

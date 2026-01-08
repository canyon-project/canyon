import { BadRequestException, Injectable } from '@nestjs/common';
import { GitHubAdapter } from './adapters/github.adapter';
import { GitLabAdapter } from './adapters/gitlab.adapter';
import { IProviderAdapter } from './interfaces/provider-adapter.interface';

@Injectable()
export class ProviderService {
  private adapters: Map<string, IProviderAdapter>;

  constructor(
    private readonly gitlabAdapter: GitLabAdapter,
    private readonly githubAdapter: GitHubAdapter,
  ) {
    this.adapters = new Map();
    this.adapters.set('gitlab', gitlabAdapter);
    this.adapters.set('github', githubAdapter);
  }

  /**
   * 获取指定 provider 的适配器
   */
  private getAdapter(provider: string): IProviderAdapter {
    const adapter = this.adapters.get(provider.toLowerCase());
    if (!adapter) {
      throw new BadRequestException(`不支持的 provider: ${provider}`);
    }
    return adapter;
  }

  /**
   * 比较两个 commit
   */
  async compareCommits(
    provider: string,
    projectId: string,
    from: string,
    to: string,
  ): Promise<any> {
    const adapter = this.getAdapter(provider);
    return adapter.compareCommits(projectId, from, to);
  }

  /**
   * 获取仓库信息
   */
  async getRepository(provider: string, projectId: string): Promise<any> {
    const adapter = this.getAdapter(provider);
    return adapter.getRepository(projectId);
  }
}

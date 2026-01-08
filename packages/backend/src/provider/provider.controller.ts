import { Controller, Get, Query } from '@nestjs/common';
import { ProviderService } from './provider.service';

@Controller('api/provider')
export class ProviderController {
  constructor(private readonly providerService: ProviderService) {}

  /**
   * 比较两个 commit
   * GET /api/provider/compare?provider=gitlab&projectId=111930&from=xxx&to=xxx
   */
  @Get('compare')
  async compareCommits(
    @Query('provider') provider: string,
    @Query('projectId') projectId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    if (!provider || !projectId || !from || !to) {
      return {
        success: false,
        message: '缺少必需参数: provider, projectId, from, to',
      };
    }

    try {
      const result = await this.providerService.compareCommits(
        provider,
        projectId,
        from,
        to,
      );
      return result;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '比较 commit 失败',
      };
    }
  }

  /**
   * 获取仓库信息
   * GET /api/provider/repository?provider=gitlab&projectId=111930
   */
  @Get('repository')
  async getRepository(
    @Query('provider') provider: string,
    @Query('projectId') projectId: string,
  ) {
    if (!provider || !projectId) {
      return {
        success: false,
        message: '缺少必需参数: provider, projectId',
      };
    }

    try {
      const result = await this.providerService.getRepository(
        provider,
        projectId,
      );
      return result;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '获取仓库信息失败',
      };
    }
  }
}

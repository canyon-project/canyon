import { Controller, Query, Get, Param } from '@nestjs/common';
import { GetRepoCommitsByRepoIdServices } from './services/get-repo-commits-by-repo-id.services';
import { GetRepoCommitByCommitShaServices } from './services/get-repo-commit-by-commit-sha.services';
import { RepoService } from './services/repo.service';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@ApiTags('Repository')
@Controller('')
export class RepoController {
  constructor(
    private readonly getRepoCommitsByRepoIdServices: GetRepoCommitsByRepoIdServices,
    private readonly getRepoCommitByCommitSHAServices: GetRepoCommitByCommitShaServices,
    private readonly repoService: RepoService,
  ) {}

  // 获取 repository
  @ApiOperation({ summary: 'Get repositories' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved repositories' })
  @Get('api/repo')
  async getRepos(@Query('page') page: number, @Query('limit') limit: number) {
    return this.repoService.getRepoList(page, limit);
  }

  @ApiOperation({ summary: 'Get repository by ID' })
  @ApiParam({ name: 'repoID', description: 'Repository ID' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved repository' })
  @Get('api/repo/:repoID')
  async getRepoByRepoId(@Param() param) {
    return this.repoService.getByRepoId(param.repoID);
  }

  @ApiOperation({ summary: 'Get repository commits' })
  @ApiParam({ name: 'repoID', description: 'Repository ID' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved repository commits' })
  @Get('api/repo/:repoID/commits')
  async getRepoCommitsByRepoId(@Param() param) {
    return this.getRepoCommitsByRepoIdServices.invoke(param.repoID);
  }

  @ApiOperation({ summary: 'Get specific commit by SHA' })
  @ApiParam({ name: 'repoID', description: 'Repository ID' })
  @ApiParam({ name: 'sha', description: 'Commit SHA' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved commit details' })
  @Get('api/repo/:repoID/commits/:sha')
  async getRepoCommitByCommitSHA(@Param() param) {
    return this.getRepoCommitByCommitSHAServices.invoke(
      param.repoID,
      param.sha,
    );
  }
}

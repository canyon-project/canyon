import { Controller, Query, Get, Param } from '@nestjs/common';
import { GetRepoCommitsByRepoIdServices } from './services/get-repo-commits-by-repo-id.services';
import { GetRepoCommitByCommitShaServices } from './services/get-repo-commit-by-commit-sha.services';
import { RepoService } from './services/repo.service';

@Controller('')
export class ProjectController {
  constructor(
    private readonly getRepoCommitsByRepoIdServices: GetRepoCommitsByRepoIdServices,
    private readonly getRepoCommitByCommitSHAServices: GetRepoCommitByCommitShaServices,
    private readonly repoService: RepoService,
  ) {}
  @Get('api/repo/:repoID')
  async getRepoByRepoId(@Param() param) {
    return this.repoService.getByRepoId(param.repoID);
  }
  @Get('api/repo/:repoID/commits')
  async getRepoCommitsByRepoId(@Param() param) {
    return this.getRepoCommitsByRepoIdServices.invoke(param.repoID);
  }

  @Get('api/repo/:repoID/commits/:sha')
  async getRepoCommitByCommitSHA(@Param() param) {
    return this.getRepoCommitByCommitSHAServices.invoke(
      param.repoID,
      param.sha,
    );
  }
}

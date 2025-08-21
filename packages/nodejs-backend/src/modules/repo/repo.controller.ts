import { Controller, Get, Param, Post, Query, Body } from '@nestjs/common';
import { RepoService } from './repo.service';

@Controller('repo')
export class RepoController {
  constructor(private readonly repo: RepoService) {}

  @Get('')
  getRepos(@Query('keyword') keyword?: string) {
    return this.repo.getRepos(keyword);
  }

  @Post('id')
  postRepoById(@Body('id') id: string) {
    return this.repo.postRepoById(id);
  }

  @Get(':repoID/commits')
  getRepoCommits(@Param('repoID') repoID: string) {
    return this.repo.getRepoCommits(repoID);
  }

  @Get(':repoID/pulls')
  getRepoPulls(@Param('repoID') repoID: string) {
    return this.repo.getRepoPulls(repoID);
  }

  @Get(':repoID/commits/:sha')
  getRepoCommitBySHA(@Param('repoID') repoID: string, @Param('sha') sha: string) {
    return this.repo.getRepoCommitBySHA(repoID, sha);
  }
}



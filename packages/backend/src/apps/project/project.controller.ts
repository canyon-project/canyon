import { Controller, Query, Get, Param } from '@nestjs/common';
import { GetRepoCommitsByRepoIdServices } from './services/get-repo-commits-by-repo-id.services';
import { GetRepoCommitByCommitShaServices } from './services/get-repo-commit-by-commit-sha.services';

@Controller('')
export class ProjectController {
  constructor(
    private readonly getRepoCommitsByRepoIdServices: GetRepoCommitsByRepoIdServices,
    private readonly getRepoCommitByCommitSHAServices: GetRepoCommitByCommitShaServices,
  ) {}
  @Get('api/project/coverage')
  async getProjectCoverage(@Query() query) {
    // TODO: 实现覆盖率数据处理逻辑
    return {
      repoID: 'xxx',
      sha: 'xxx',
      buildList: [
        {
          buildID: 'xxx',
          buildProvider: 'xxx',
          summary: {},
          modeList: [
            {
              mode: 'auto',
              summary: {},
              reportList: [
                {
                  reportID: 'xxx',
                  reportProvider: 'xxx',
                  summary: {},
                },
              ],
            },
          ],
        },
      ],
    };
  }

  @Get('api/repo/:repoID/commits')
  async getRepoCommitsByRepoId(@Param() param) {
    return this.getRepoCommitsByRepoIdServices.invoke(param.repoID);
  }

  @Get('api/repo/:repoID/commits/:sha')
  async getRepoCommitByCommitSHA(@Param() param) {
    return this.getRepoCommitByCommitSHAServices.invoke(param.repoID, param.sha);
  }
}

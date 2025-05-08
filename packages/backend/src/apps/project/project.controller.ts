import { Controller, Query, Get, Param } from '@nestjs/common';
import { GetRepoCommitsByRepoIdServices } from './services/get-repo-commits-by-repo-id.services';

@Controller('')
export class ProjectController {
  constructor(
    private readonly getRepoCommitsByRepoIdServices: GetRepoCommitsByRepoIdServices,
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
}

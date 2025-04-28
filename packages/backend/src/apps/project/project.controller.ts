import { Controller, Post, Body, Query, Get } from '@nestjs/common';
// import { GetProjectCoverageService } from './services/get-project-coverage.service';
// import { CoverageClientDto } from './dto/coverage-client.dto';
// import { CoverageClientService } from './services/coverage-client.service';

@Controller('')
export class ProjectController {
  constructor() {}
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
}

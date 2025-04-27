import { Controller, Post, Body, Query, Get } from '@nestjs/common';
import { GetProjectCoverageService } from './services/get-project-coverage.service';
// import { CoverageClientDto } from './dto/coverage-client.dto';
// import { CoverageClientService } from './services/coverage-client.service';

@Controller('')
export class ProjectController {
  constructor(private getProjectCoverageService: GetProjectCoverageService) {}
  @Get('api/project/coverage')
  async getProjectCoverage(@Query() query) {
    // TODO: 实现覆盖率数据处理逻辑
    return this.getProjectCoverageService.invoke(
      query.provider,
      query.repoID,
      query.sha,
      query.buildProvider,
      query.buildID,
    );
  }

  //   /projects/gitlab/canyon-projects/coverage?sha=1234567890abcdef
}

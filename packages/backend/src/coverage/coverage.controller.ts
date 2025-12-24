import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommitsQueryDto } from './dto/commits-query.dto';
import { MapQueryDto } from './dto/map.dto';
import { CoverageCommitsService } from './services/coverage-commits.service';
import { CoverageMapForCommitService } from './services/coverage-map-for-commit.service';

@ApiTags('coverage')
@Controller('api/coverage')
export class CoverageController {
  constructor(
    private readonly coverageMapForCommitService: CoverageMapForCommitService,
    private readonly coverageCommitsService: CoverageCommitsService,
  ) {}

  @Get('map')
  async getMap(@Query() q: MapQueryDto) {
    const { subject } = q;
    switch (subject) {
      case 'commit':
        return this.coverageMapForCommitService.invoke({
          provider: q.provider,
          repoID: q.repoID,
          sha: q.subjectID,
          buildTarget: q.buildTarget || '',
          // buildID: q.buildID,
          reportProvider: q.reportProvider,
          reportID: q.reportID,
          filePath: q.filePath,
        });
      default:
        throw new BadRequestException('invalid subject');
    }
  }

  @Get('commits')
  @ApiOperation({ summary: '获取 commits 列表' })
  @ApiResponse({ status: 200, description: '返回 commits 列表' })
  async getCommits(@Query() q: CommitsQueryDto) {
    const page = q.page ? parseInt(q.page, 10) : 1;
    const pageSize = q.pageSize ? parseInt(q.pageSize, 10) : 10;

    if (isNaN(page) || page < 1) {
      throw new BadRequestException('Invalid page parameter');
    }
    if (isNaN(pageSize) || pageSize < 1) {
      throw new BadRequestException('Invalid pageSize parameter');
    }

    return this.coverageCommitsService.findCommits({
      repoID: q.repoID,
      search: q.search,
      defaultBranch: q.defaultBranch,
      page,
      pageSize,
    });
  }
}

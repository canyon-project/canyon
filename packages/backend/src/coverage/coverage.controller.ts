import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
// @ts-expect-errorr
import { genSummaryMapByCoverageMap } from 'canyon-data';
import { CommitsQueryDto } from './dto/commits.dto';
import { MapQueryDto } from './dto/map.dto';
import { SummaryMapQueryDto } from './dto/summary-map.dto';
import { CommitsService } from './services/commits.service';
import { CoverageMapForCommitService } from './services/coverage-map-for-commit.service';

// @Public()
@Controller('api/coverage')
export class CoverageController {
  constructor(
    private readonly coverageMapForCommitService: CoverageMapForCommitService,
    private readonly commitsService: CommitsService,
  ) {}

  @Get('summary/map')
  async getSummaryMap(@Query() q: SummaryMapQueryDto) {
    const { subject } = q;
    switch (subject) {
      case 'commit': {
        const map = await this.coverageMapForCommitService.invoke({
          provider: q.provider,
          repoID: q.repoID,
          sha: q.subjectID,
          buildTarget: q.buildTarget || '',
          reportProvider: q.reportProvider,
          reportID: q.reportID,
          filePath: q.filePath,
        });
        const summary = genSummaryMapByCoverageMap(map, []);

        return summary;
      }
      default:
        throw new BadRequestException('invalid subject');
    }
  }

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
  async getCommits(@Query() q: CommitsQueryDto) {
    const commits = await this.commitsService.getCommitsByRepoID(q.repoID);
    return {
      data: commits,
      total: commits.length,
    };
  }
}

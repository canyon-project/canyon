import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { MapQueryDto } from './dto/map.dto';
import { SummaryMapQueryDto } from './dto/summary-map.dto';
import { CoverageMapService } from './services/coverage.map.service';
import { CoverageSummaryService } from './services/coverage.summary.service';

@Controller('api/coverage')
export class CoverageController {
  constructor(
    private readonly summary: CoverageSummaryService,
    private readonly map: CoverageMapService,
  ) {}

  @Get('summary/map')
  async getSummaryMap(@Query() q: SummaryMapQueryDto) {
    const { subject } = q;
    switch (subject) {
      case 'commit':
      case 'commits':
        return this.summary.getSummaryMap(q);
      case 'pull':
      case 'pulls':
        return this.summary.getSummaryMap(q);
      default:
        throw new BadRequestException('invalid subject');
    }
  }

  @Get('map')
  async getMap(@Query() q: MapQueryDto) {
    const { subject } = q;
    switch (subject) {
      case 'commit':
      case 'commits':
        return this.map.getMapForCommit({
          provider: q.provider,
          repoID: q.repoID,
          sha: q.subjectID,
          buildProvider: q.buildProvider,
          buildID: q.buildID,
          filePath: q.filePath,
        });
      case 'pull':
      case 'pulls':
        return this.map.getMapForPull({
          provider: q.provider,
          repoID: q.repoID,
          pullNumber: q.subjectID,
          buildProvider: q.buildProvider,
          buildID: q.buildID,
          filePath: q.filePath,
          mode: q.mode,
        });
      default:
        throw new BadRequestException('invalid subject');
    }
  }
}

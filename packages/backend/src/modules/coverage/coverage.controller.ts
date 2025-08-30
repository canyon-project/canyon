import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import type { CoverageMapService } from './coverage.map.service';
import type { CoverageSummaryService } from './coverage.summary.service';
import type { MapQueryDto } from './dto/map.dto';
import type { SummaryMapQueryDto } from './dto/summary-map.dto';

@Controller('coverage')
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

  // 测试：{{url}}/api/coverage/map?provider=gitlab&subjectID=5fc91cca2ed37f3ca406cb38bef8a07d9684e430&repoID=86927&filePath=src/components/B0.tsx&subject=commit
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

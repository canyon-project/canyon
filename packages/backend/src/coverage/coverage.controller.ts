import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
// @ts-expect-errorr
import { genSummaryMapByCoverageMap } from 'canyon-data';
import { MapQueryDto } from './dto/map.dto';
import { SummaryMapQueryDto } from './dto/summary-map.dto';
import { CoverageMapForCommitService } from './services/coverage-map-for-commit.service';
import { CoverageMapForMultipleCommitsService } from './services/coverage-map-for-multiple-commits.service';

// @Public()
@Controller('api/coverage')
export class CoverageController {
  constructor(
    private readonly coverageMapForCommitService: CoverageMapForCommitService,
    private readonly coverageMapForMultipleCommitsService: CoverageMapForMultipleCommitsService,
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
          // buildID: q.buildID,
          reportProvider: q.reportProvider,
          reportID: q.reportID,
          filePath: q.filePath,
          // compareTarget: q.compareTarget,
          onlyChanged: String(q.onlyChanged || '').toLowerCase() === 'true',
        });
        const summary = genSummaryMapByCoverageMap(
          map,
          Object.values(map)
            .map((m: any) => m.change)
            .filter(Boolean),
        );

        return summary;
      }
      case 'multiple-commits': {
        const map = await this.coverageMapForMultipleCommitsService.invoke({
          provider: q.provider,
          repoID: q.repoID,
          subjectID: q.subjectID,
          buildTarget: q.buildTarget || '',
          reportProvider: q.reportProvider,
          reportID: q.reportID,
          filePath: q.filePath,
          onlyChanged: String(q.onlyChanged || '').toLowerCase() === 'true',
        });
        const summary = genSummaryMapByCoverageMap(
          map,
          Object.values(map)
            .map((m: any) => m.change)
            .filter(Boolean),
        );

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
          // compareTarget: q.compareTarget, // TODO 废弃，用multiple-commits代替
          onlyChanged: String(q.onlyChanged || '').toLowerCase() === 'true',
        });
      case 'multiple-commits':
        return this.coverageMapForMultipleCommitsService.invoke({
          provider: q.provider,
          repoID: q.repoID,
          subjectID: q.subjectID,
          buildTarget: q.buildTarget || '',
          reportProvider: q.reportProvider,
          reportID: q.reportID,
          filePath: q.filePath,
          onlyChanged: String(q.onlyChanged || '').toLowerCase() === 'true',
        });
      default:
        throw new BadRequestException('invalid subject');
    }
  }
}

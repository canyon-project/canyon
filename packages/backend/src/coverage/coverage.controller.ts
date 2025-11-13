import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
// @ts-expect-error
import { genSummaryMapByCoverageMap } from 'canyon-data';
// import { Public } from 'src/auth/public.decorator';
import { MapQueryDto } from './dto/map.dto';
import { SummaryMapQueryDto } from './dto/summary-map.dto';
import { CoverageMapForCommitService } from './services/coverage-map-for-commit.service';
import { CoverageMapForPullService } from './services/coverage-map-for-pull.service';
// import { CoverageMapForPullService } from './services/coverage-map-for-pull.service';

// @Public()
@Controller('api/coverage')
export class CoverageController {
  constructor(
    private readonly coverageMapForCommitService: CoverageMapForCommitService,
    private readonly coverageMapForPullService: CoverageMapForPullService,
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
      case 'pull': {
        const map = await this.coverageMapForPullService.invoke({
          provider: q.provider,
          repoID: q.repoID,
          pullID: q.subjectID,
          buildTarget: q.buildTarget || '',
          // buildID: q.buildID,
          reportProvider: q.reportProvider,
          reportID: q.reportID,
          filePath: q.filePath,
          mode: q.mode,
          onlyChanged: true,
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
      // case 'multiple-commits':
      //   return this.coverageMapForPullService.invokeForMultipleCommits({
      //     provider: q.provider,
      //     repoID: q.repoID,
      //     commitRange: q.subjectID,
      //     filePath: q.filePath,
      //     mode: q.mode,
      //   });
      case 'pull':
        return this.coverageMapForPullService.invoke({
          provider: q.provider,
          repoID: q.repoID,
          pullID: q.subjectID,
          buildTarget: q.buildTarget || '',
          // buildID: q.buildID,
          reportProvider: q.reportProvider,
          reportID: q.reportID,
          filePath: q.filePath,
          mode: q.mode,
          onlyChanged: true,
        });
      default:
        throw new BadRequestException('invalid subject');
    }
  }
}

import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import {
  type CoverageFileMapEntry,
  summarizeCoverageFromMap,
} from './coverage.utils';
import { MapQueryDto } from './dto/map.dto';
import { SummaryMapQueryDto } from './dto/summary-map.dto';
import { CoverageMapForCommitService } from './services/coverage-map-for-commit.service';
// import { CoverageMapService } from './services/coverage.map.service';

@Controller('api/coverage')
export class CoverageController {
  constructor(
    private readonly coverageMapForCommitService: CoverageMapForCommitService,
  ) {}

  // @Get('summary/map')
  // async getSummaryMap(@Query() q: SummaryMapQueryDto) {
  //   const { subject } = q;
  //   const percent = (covered: number, total: number) =>
  //     total <= 0
  //       ? 100.0
  //       : Math.floor((1000 * 100 * covered) / total / 10) / 100;
  //   switch (subject) {
  //     case 'commit':
  //     case 'commits': {
  //       const map = await this.map.getMapForCommit({
  //         provider: q.provider,
  //         repoID: q.repoID,
  //         sha: q.subjectID,
  //         buildProvider: q.buildProvider,
  //         buildID: q.buildID,
  //         reportProvider: q.reportProvider,
  //         reportID: q.reportID,
  //         filePath: q.filePath,
  //         compareTarget: q.compareTarget,
  //         onlyChanged: String(q.onlyChanged || '').toLowerCase() === 'true',
  //       });
  //       return summarizeCoverageFromMap(
  //         map as Record<string, CoverageFileMapEntry>,
  //         percent,
  //       );
  //     }
  //     // case 'pull':
  //     // case 'pulls': {
  //     //   const map = await this.map.getMapForPull({
  //     //     provider: q.provider,
  //     //     repoID: q.repoID,
  //     //     pullNumber: q.subjectID,
  //     //     filePath: q.filePath,
  //     //     mode: q.mode,
  //     //   });
  //     //   return summarizeCoverageFromMap(
  //     //     map as Record<string, CoverageFileMapEntry>,
  //     //     percent,
  //     //   );
  //     // }
  //     default:
  //       throw new BadRequestException('invalid subject');
  //   }
  // }

  @Get('map')
  async getMap(@Query() q: MapQueryDto) {
    const { subject } = q;
    switch (subject) {
      case 'commit':
      case 'commits':
        return this.coverageMapForCommitService.invoke({
          provider: q.provider,
          repoID: q.repoID,
          sha: q.subjectID,
          buildProvider: q.buildProvider,
          buildID: q.buildID,
          reportProvider: q.reportProvider,
          reportID: q.reportID,
          filePath: q.filePath,
          compareTarget: q.compareTarget,
          onlyChanged: String(q.onlyChanged || '').toLowerCase() === 'true',
        });
      // case 'pull':
      // case 'pulls':
      //   return this.map.getMapForPull({
      //     provider: q.provider,
      //     repoID: q.repoID,
      //     pullNumber: q.subjectID,
      //     filePath: q.filePath,
      //     mode: q.mode,
      //     // TODO 复杂度较高，先不做。先做整体pull的覆盖率
      //     // buildProvider: q.buildProvider,
      //     // buildID: q.buildID,
      //     // reportProvider: q.reportProvider,
      //     // reportID: q.reportID,
      //     // buildTarget: q.buildTarget
      //   });
      default:
        throw new BadRequestException('invalid subject');
    }
  }
}

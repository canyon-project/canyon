import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
// @ts-expect-error canyon-data 可能缺少类型导出，但运行时可用
import { genSummaryMapByCoverageMap } from 'canyon-data';
import { MapQueryDto } from './dto/map.dto';
import { SummaryMapQueryDto } from './dto/summary-map.dto';
// import { CoverageMapForCommitService } from './services/coverage-map-for-commit.service';
import { CoverageMapForPullService } from './services/coverage-map-for-pull.service';

@Controller('api/coverage')
export class CoverageController {
  constructor(
    // private readonly coverageMapForCommitService: CoverageMapForCommitService,
    private readonly coverageMapForPullService: CoverageMapForPullService,
  ) {}

  @Get('summary/map')
  async getSummaryMap(@Query() q: SummaryMapQueryDto) {
    const { subject } = q;
    const percent = (covered: number, total: number) =>
      total <= 0
        ? 100.0
        : Math.floor((1000 * 100 * covered) / total / 10) / 100;
    switch (subject) {
      // case 'commit':
      // case 'commits': {
      //   const map = await this.coverageMapForCommitService.invoke({
      //     provider: q.provider,
      //     repoID: q.repoID,
      //     sha: q.subjectID,
      //     reportProvider: q.reportProvider,
      //     reportID: q.reportID,
      //     filePath: q.filePath,
      //     onlyChanged: String(q.onlyChanged || '').toLowerCase() === 'true',
      //   });
      //   const summary = genSummaryMapByCoverageMap(
      //     map,
      //     Object.values(map)
      //       .map((m: any) => m.change)
      //       .filter(Boolean),
      //   );
      //
      //   return summary;
      // }
      case 'multiple-commits': {
        const map = await this.coverageMapForPullService.multipleCommits({
          provider: q.provider,
          repoID: q.repoID,
          commitRange: q.subjectID,
          filePath: q.filePath,
          mode: q.mode,
        });
        const summary = genSummaryMapByCoverageMap(
          map,
          Object.values(map)
            .map((m: any) => m.change)
            .filter(Boolean),
        );
        return summary;
      }
      case 'pull':
      case 'pulls': {
        const map = await this.coverageMapForPullService.pull({
          provider: q.provider,
          repoID: q.repoID,
          pullID: q.subjectID,
          filePath: q.filePath,
          mode: q.mode,
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
      // case 'commit':
      // case 'commits':
      //   return this.coverageMapForCommitService.invoke({
      //     provider: q.provider,
      //     repoID: q.repoID,
      //     sha: q.subjectID,
      //     reportProvider: q.reportProvider,
      //     reportID: q.reportID,
      //     filePath: q.filePath,
      //     onlyChanged: String(q.onlyChanged || '').toLowerCase() === 'true',
      //   });
      case 'multiple-commits':
        return this.coverageMapForPullService.multipleCommits({
          provider: q.provider,
          repoID: q.repoID,
          commitRange: q.subjectID,
          filePath: q.filePath,
          mode: q.mode,
        });
      case 'pull':
      case 'pulls':
        return this.coverageMapForPullService.pull({
          provider: q.provider,
          repoID: q.repoID,
          pullID: q.subjectID,
          filePath: q.filePath,
          mode: q.mode,
        });
      default:
        throw new BadRequestException('invalid subject');
    }
  }
}

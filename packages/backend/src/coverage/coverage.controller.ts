import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
// @ts-expect-errorr
import { genSummaryMapByCoverageMap } from 'canyon-data';
import { CommitsQueryDto } from './dto/commits.dto';
import { MapQueryDto } from './dto/map.dto';
import { SummaryMapQueryDto } from './dto/summary-map.dto';
import { CommitsService } from './services/commits.service';
import { CoverageMapForAnalysisService } from './services/coverage-map-for-analysis.service';
import { CoverageMapForCommitService } from './services/coverage-map-for-commit.service';

// @Public()
@Controller('api/coverage')
export class CoverageController {
  constructor(
    private readonly coverageMapForCommitService: CoverageMapForCommitService,
    private readonly coverageMapForAnalysisService: CoverageMapForAnalysisService,
    private readonly commitsService: CommitsService,
  ) {}

  @Get('summary/map')
  async getSummaryMap(@Query() summaryMapQueryDto: SummaryMapQueryDto) {
    const { subject } = summaryMapQueryDto;
    switch (subject) {
      case 'commit': {
        const map = await this.coverageMapForCommitService.invoke({
          provider: summaryMapQueryDto.provider,
          repoID: summaryMapQueryDto.repoID,
          sha: summaryMapQueryDto.subjectID,
          buildTarget: summaryMapQueryDto.buildTarget || '',
          filePath: summaryMapQueryDto.filePath,
          scene: summaryMapQueryDto.scene, // 新增字段，起筛选作用
        });
        const summary = genSummaryMapByCoverageMap(map, []);
        return summary;
      }
      case 'analysis': {
        const result = await this.coverageMapForAnalysisService.invoke({
          provider: summaryMapQueryDto.provider,
          repoID: summaryMapQueryDto.repoID,
          analysisID: summaryMapQueryDto.subjectID,
          buildTarget: summaryMapQueryDto.buildTarget || '',
          filePath: summaryMapQueryDto.filePath,
        });




        // analysis service 返回的是 { success, baseCommit, comparisonResults, coverage }
        // 我们需要使用 coverage 字段来生成 summary
        if (result.success && result.coverage) {
          const c = Object.values(result.coverage)
          .map((m: any) => {
            return {
              path: m.path,
              additions: m?.diff?.additions || [],
            };
          })
          .filter((item) => item.additions.length > 0);
          const summary = genSummaryMapByCoverageMap(result.coverage, c);
          return summary;
        }
        throw new BadRequestException('Failed to get analysis coverage data');
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
          filePath: q.filePath,
          scene: q.scene, // 新增字段，起筛选作用
        });
      case 'analysis':
        return this.coverageMapForAnalysisService
          .invoke({
            provider: q.provider,
            repoID: q.repoID,
            analysisID: q.subjectID,
            buildTarget: q.buildTarget || '',
            filePath: q.filePath,
          })
          .then((result) => {
            if (result.success && result.coverage) {
              return result.coverage;
            }
            throw new BadRequestException(
              'Failed to get analysis coverage data',
            );
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

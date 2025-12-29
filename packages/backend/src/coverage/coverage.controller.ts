import {
  BadRequestException,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Res,
} from '@nestjs/common';
// import express from 'express';
// import * as fs from 'fs';
// @ts-expect-errorr
import { genSummaryMapByCoverageMap } from 'canyon-data';
import { MapQueryDto } from './dto/map.dto';
import { SummaryMapQueryDto } from './dto/summary-map.dto';
// import {ExportReportDto} from './dto/export-report.dto';
import { CoverageMapForCommitService } from './services/coverage-map-for-commit.service';

// @Public()
@Controller('api/coverage')
export class CoverageController {
  constructor(
    private readonly coverageMapForCommitService: CoverageMapForCommitService,
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
}

import { BadRequestException, Controller, Get, Query, Post, Res, HttpStatus } from '@nestjs/common';
import express from 'express';
import * as fs from 'fs';
// @ts-expect-errorr
import {genSummaryMapByCoverageMap} from 'canyon-data';
import {MapQueryDto} from './dto/map.dto';
import {SummaryMapQueryDto} from './dto/summary-map.dto';
import {ExportReportDto} from './dto/export-report.dto';
import {CoverageMapForCommitService} from './services/coverage-map-for-commit.service';
import {CoverageMapForMultipleCommitsService} from './services/coverage-map-for-multiple-commits.service';
import {ReportExportService} from './services/report-export.service';

// @Public()
@Controller('api/coverage')
export class CoverageController {
  constructor(
    private readonly coverageMapForCommitService: CoverageMapForCommitService,
    private readonly coverageMapForMultipleCommitsService: CoverageMapForMultipleCommitsService,
    private readonly reportExportService: ReportExportService,
  ) {
  }

  @Get('summary/map')
  async getSummaryMap(@Query() q: SummaryMapQueryDto) {
    const {subject} = q;
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
      case 'multiple-commits': {
        const map = await this.coverageMapForMultipleCommitsService.invoke({
          provider: q.provider,
          repoID: q.repoID,
          subjectID: q.subjectID,
          buildTarget: q.buildTarget || '',
          reportProvider: q.reportProvider,
          reportID: q.reportID,
          filePath: q.filePath,
        });

        const c = Object.values(map)
          .map((m: any) => {
            return {
              path: m.path,
              additions: m?.change?.additions || [],
            };
          })
          .filter((item) => item.additions.length > 0);

        const summary = genSummaryMapByCoverageMap(map, c);

        return summary;
      }
      default:
        throw new BadRequestException('invalid subject');
    }
  }

  @Get('map')
  async getMap(@Query() q: MapQueryDto) {
    const {subject} = q;
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
      case 'multiple-commits':
        return this.coverageMapForMultipleCommitsService.invoke({
          provider: q.provider,
          repoID: q.repoID,
          subjectID: q.subjectID,
          buildTarget: q.buildTarget || '',
          reportProvider: q.reportProvider,
          reportID: q.reportID,
          filePath: q.filePath,
        });
      default:
        throw new BadRequestException('invalid subject');
    }
  }

  @Get('export')
  async exportReport(@Query() params: ExportReportDto, @Res() res: express.Response) {
    try {
      const { filePath, fileName } = await this.reportExportService.exportReport(params);

      // 设置响应头
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', fs.statSync(filePath).size);

      // 创建文件流并发送
      const fileStream = fs.createReadStream(filePath);

      fileStream.on('end', async () => {
        // 文件发送完成后清理临时文件
        await this.reportExportService.cleanupTempFile(filePath);
      });

      fileStream.on('error', async (error) => {
        console.error('File stream error:', error);
        await this.reportExportService.cleanupTempFile(filePath);
        if (!res.headersSent) {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to download report',
          });
        }
      });

      fileStream.pipe(res);
    } catch (error) {
      console.error('Export error:', error);
      if (!res.headersSent) {
        res.status(HttpStatus.BAD_REQUEST).json({
          error: error.message || 'Failed to export report',
        });
      }
    }
  }
}

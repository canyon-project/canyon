import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CodeService } from '../code/service/code.service';
import { CoverageController } from './coverage.controller';
import { CommitsService } from './services/commits.service';
import { CoverageMapStoreService } from './services/coverage.map-store.service';
import { CoverageMapForCommitService } from './services/coverage-map-for-commit.service';
// import { CoverageMapForMultipleCommitsService } from './services/coverage-map-for-multiple-commits.service';
// import { ReportExportService } from './services/report-export.service';
// import { GitLabService } from './services/gitlab.service';

@Module({
  imports: [ConfigModule],
  controllers: [CoverageController],
  providers: [
    CoverageMapForCommitService,
    // CoverageMapForMultipleCommitsService,
    CoverageMapStoreService,
    CommitsService,
    CodeService,
    // ReportExportService,
    // GitLabService,
  ],
})
export class CoverageModule {}

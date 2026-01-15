import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CodeService } from '../code/service/code.service';
import { CoverageController } from './coverage.controller';
import { CommitsService } from './services/commits.service';
import { CoverageMapForAnalysisService } from './services/coverage-map-for-analysis.service';
import { CoverageMapForCommitService } from './services/coverage-map-for-commit.service';

@Module({
  imports: [ConfigModule],
  controllers: [CoverageController],
  providers: [
    CoverageMapForCommitService,
    CommitsService,
    CodeService,
    CoverageMapForAnalysisService,
  ],
})
export class CoverageModule {}

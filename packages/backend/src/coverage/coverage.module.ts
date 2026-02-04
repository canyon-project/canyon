import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CodeService } from '../code/service/code.service';
import { CoverageController } from './coverage.controller';
import { CommitsService } from './services/commits.service';
import { CoverageMapForAccumulativeService } from './services/coverage-map-for-accumulative.service';
import { CoverageMapForCommitService } from './services/coverage-map-for-commit.service';
import { CoverageMapForCrService } from './services/coverage-map-for-cr.service';

@Module({
  imports: [ConfigModule],
  controllers: [CoverageController],
  providers: [
    CoverageMapForCommitService,
    CommitsService,
    CodeService,
    CoverageMapForAccumulativeService,
    CoverageMapForCrService,
  ],
})
export class CoverageModule {}

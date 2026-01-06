import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CodeService } from '../code/service/code.service';
import { CoverageController } from './coverage.controller';
import { CommitsService } from './services/commits.service';
import { CoverageMapStoreService } from './services/coverage.map-store.service';
import { CoverageMapForCommitService } from './services/coverage-map-for-commit.service';

@Module({
  imports: [ConfigModule],
  controllers: [CoverageController],
  providers: [
    CoverageMapForCommitService,
    CoverageMapStoreService,
    CommitsService,
    CodeService,
  ],
})
export class CoverageModule {}

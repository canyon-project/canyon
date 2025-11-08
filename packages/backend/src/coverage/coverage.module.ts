import { Module } from '@nestjs/common';
import { CodeService } from '../code/service/code.service';
import { CoverageController } from './coverage.controller';
import { CoverageMapStoreService } from './services/coverage.map-store.service';
// import { CoverageOverviewService } from './services/coverage.overview.service';
import { CoverageMapForCommitService } from './services/coverage-map-for-commit.service';
import { CoverageMapForPullService } from './services/coverage-map-for-pull.service';
// import { CoverageMapForPullService } from './services/coverage-map-for-pull.service';

@Module({
  imports: [],
  controllers: [CoverageController],
  providers: [
    // CoverageOverviewService,
    CoverageMapForCommitService,
    CoverageMapForPullService,
    CoverageMapStoreService,
    CodeService,
  ],
})
export class CoverageModule {}

import { Module } from '@nestjs/common';
import { CodeService } from '../code/service/code.service';
import { CoverageController } from './coverage.controller';
import { CoverageMapStoreService } from './services/coverage.map-store.service';
import { CoverageMapForCommitService } from './services/coverage-map-for-commit.service';

@Module({
  imports: [],
  controllers: [CoverageController],
  providers: [
    CoverageMapForCommitService,
    CoverageMapStoreService,
    CodeService,
  ],
})
export class CoverageModule {}

import { Module } from '@nestjs/common';
import { CoverageController } from './coverage.controller';
import { CoverageMapForCommitService } from './services/coverage-map-for-commit.service';

@Module({
  imports: [],
  controllers: [CoverageController],
  providers: [
    CoverageMapForCommitService,
  ],
})
export class CoverageModule {}

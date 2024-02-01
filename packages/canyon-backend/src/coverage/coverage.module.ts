import { Module } from '@nestjs/common';
// import { AppService } from './app.service';
import { RetrieveCoverageTreeSummaryService } from './services/retrieve-coverage-tree-summary.service';
import { CoverageClientService } from './services/coverage-client.service';
import { PrismaService } from '../prisma/prisma.service';
import { CoverageController } from './coverage.controller';
import { CoverageService } from './services/coverage.service';

@Module({
  imports: [],
  controllers: [CoverageController],
  providers: [
    // AppService,
    PrismaService,
    CoverageClientService,
    RetrieveCoverageTreeSummaryService,
    CoverageService,
  ],
})
export class CoverageModule {}

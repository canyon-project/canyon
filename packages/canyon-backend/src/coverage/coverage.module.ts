import { Module } from '@nestjs/common';
import { RetrieveCoverageTreeSummaryService } from './services/retrieve-coverage-tree-summary.service';
import { CoverageClientService } from './services/coverage-client.service';
import { PrismaService } from '../prisma/prisma.service';
import { CoverageController } from './coverage.controller';
import { CoverageService } from './services/coverage.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CoverageData,
  CoverageDataSchema,
} from './schemas/coverage-data.schema';
import { CoverageDataAdapterService } from './services/coverage-data-adapter.service';
import { ConsumerCoverageService } from './services/consumer-coverage.service';
import { PullChangeCodeAndInsertDbService } from './services/pull-change-code-and-insert-db.service';
import { CoverageLog, CoverageLogSchema } from './schemas/coverage-log.schema';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoveragediskEntity } from './coveragedisk.entity';
import { CoveragediskService } from './services/coveragedisk.service';
import { TestCoverage } from './services/test.coverage';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CoverageData.name,
        schema: CoverageDataSchema,
        collection: 'canyon_coverage_data',
      },
      {
        name: CoverageLog.name,
        schema: CoverageLogSchema,
        collection: 'canyon_coverage_log',
      },
    ]),
    TypeOrmModule.forFeature([CoveragediskEntity]),
  ],
  controllers: [CoverageController],
  providers: [
    PrismaService,
    CoverageClientService,
    RetrieveCoverageTreeSummaryService,
    CoverageService,
    CoverageDataAdapterService,
    ConsumerCoverageService,
    PullChangeCodeAndInsertDbService,
    CoveragediskService,
    TestCoverage,
  ],
})
export class CoverageModule {}

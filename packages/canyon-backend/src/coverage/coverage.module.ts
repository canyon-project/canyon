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
import { CoverageDataAdapterService } from './services/common/coverage-data-adapter.service';
import { ConsumerCoverageService } from './services/core/consumer-coverage.service';
import { PullChangeCodeAndInsertDbService } from './services/common/pull-change-code-and-insert-db.service';
import { CoverageLog, CoverageLogSchema } from './schemas/coverage-log.schema';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoveragediskEntity } from './entity/coveragedisk.entity';
import { CoveragediskService } from './services/core/coveragedisk.service';
import { TestExcludeService } from './services/common/test-exclude.service';
import {
  CoverageTest,
  CoverageTestSchema,
} from './schemas/coverage-test.schema';
import { CoverageTestController } from './coverage-test.controller';
import { CoverageTestService } from './services/coverage-test.service';

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
      {
        name: CoverageTest.name,
        schema: CoverageTestSchema,
        collection: 'canyon_coverage_test',
      },
    ]),
    TypeOrmModule.forFeature([CoveragediskEntity]),
  ],
  controllers: [CoverageController, CoverageTestController],
  providers: [
    PrismaService,
    CoverageClientService,
    RetrieveCoverageTreeSummaryService,
    CoverageService,
    CoverageDataAdapterService,
    ConsumerCoverageService,
    PullChangeCodeAndInsertDbService,
    CoveragediskService,
    TestExcludeService,
    CoverageTestService,
  ],
})
export class CoverageModule {}

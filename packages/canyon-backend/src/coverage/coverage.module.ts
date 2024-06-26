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
import { PullFilePathAndInsertDbService } from './services/common/pull-file-path-and-insert-db.service';
import {CoverageReportsService} from "./services/coverage-reports.service";

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
      }
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
    PullFilePathAndInsertDbService,
    CoveragediskService,
    TestExcludeService,
    CoverageReportsService
  ],
})
export class CoverageModule {}

import { Module } from "@nestjs/common";
import { CoverageClientService } from "./services/coverage-client.service";
import { PrismaService } from "../prisma/prisma.service";
import { CoverageController } from "./coverage.controller";
import { CoverageService } from "./services/coverage.service";
import { ConsumerCoverageService } from "./services/core/consumer-coverage.service";
import { PullChangeCodeAndInsertDbService } from "./services/common/pull-change-code-and-insert-db.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CoveragediskEntity } from "./entity/coveragedisk.entity";
import { CoveragediskService } from "./services/core/coveragedisk.service";
import { TestExcludeService } from "./services/common/test-exclude.service";
import { PullFilePathAndInsertDbService } from "./services/common/pull-file-path-and-insert-db.service";
import { CoverageReportsService } from "./services/coverage-reports.service";
import { GetCoverageLogsService } from "./services/get-coverage-logs.service";
import { CoverageResolver } from "./coverage.resolver";

@Module({
  imports: [TypeOrmModule.forFeature([CoveragediskEntity])],
  controllers: [CoverageController],
  providers: [
    CoverageResolver,
    PrismaService,
    CoverageClientService,
    CoverageService,
    ConsumerCoverageService,
    PullChangeCodeAndInsertDbService,
    PullFilePathAndInsertDbService,
    CoveragediskService,
    TestExcludeService,
    CoverageReportsService,
    GetCoverageLogsService,
  ],
})
export class CoverageModule {}

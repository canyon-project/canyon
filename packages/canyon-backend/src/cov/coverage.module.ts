import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CoverageController } from "./coverage.controller";
import { CoveragePreStoreService } from "./services/coverage-pre-store.service";
import { CoverageDataComputeService } from "./services/coverage-data-compute.service";
import { CoverageService } from "./services/coverage.service";
import { CoverageFinalService } from "./services/common/coverage-final.service";
import { CoverageReportsService } from "./services/coverage-reports.service";
import {TestExcludeService} from "../apps/collect/services/common/test-exclude.service";

@Module({
  controllers: [CoverageController],
  providers: [
    PrismaService,
    CoveragePreStoreService,
    CoverageService,
    CoverageDataComputeService,
    CoverageFinalService,
    TestExcludeService,
    CoverageReportsService,
  ],
})
export class CoverageModule {}

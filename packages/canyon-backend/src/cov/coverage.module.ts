import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CoverageController } from "./coverage.controller";
import { CoveragePreStoreService } from "./services/coverage-pre-store.service";
import { TestExcludeService } from "./services/common/test-exclude.service";
import { CoverageDataComputeService } from "./services/coverage-data-compute.service";
import { CoverageService } from "./services/coverage.service";
import { CoverageFinalService } from "./services/common/coverage-final.service";

@Module({
    controllers: [CoverageController],
    providers: [
        PrismaService,
        CoveragePreStoreService,
        CoverageService,
        CoverageDataComputeService,
        CoverageFinalService,
        TestExcludeService,
    ],
})
export class CoverageModule {}

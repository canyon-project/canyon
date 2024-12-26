import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CoverageController } from "./coverage.controller";
import { CoverageService } from "./services/coverage.service";
import { TestExcludeService } from "./services/common/test-exclude.service";

@Module({
    controllers: [CoverageController],
    providers: [PrismaService, CoverageService, TestExcludeService],
})
export class CoverageModule {}

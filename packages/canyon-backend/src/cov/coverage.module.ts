import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CoverageController } from "./coverage.controller";
import { CoverageService } from "./services/coverage.service";
import { TestExcludeService } from "./services/common/test-exclude.service";
// import { TypeOrmModule } from "@nestjs/typeorm";
// import { CoveragediskEntity } from "./entity/coveragedisk.entity";
// import { TestExcludeService } from "./services/common/test-exclude.service";
// import {CoverageResolver} from "./coverage.resolver";

@Module({
    // imports: [TypeOrmModule.forFeature([CoveragediskEntity])],
    controllers: [CoverageController],
    providers: [
        // CoverageResolver,
        PrismaService,
        CoverageService,
        TestExcludeService,
    ],
})
export class CoverageModule {}

import { Module } from '@nestjs/common';
// import { CoverageResolver } from './coverage.resolver';
// import { GetCoveragesService } from './services/get-coverages.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { CoverageController } from './coverage.controller';
import { CoverageClientService } from './services/coverage-client.service';
import { CoverageFinalService } from './services/core/coverage-final.service';
// import { CoveragediskService } from './services/core/coveragedisk.service';
// import { CoveragediskEntity } from './entity/coveragedisk.entity';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { ConsumerCoverageService } from './services/core/consumer-coverage.service';
// import { CoveragePreStoreService } from './services/coverage-pre-store.service';
// import { CoverageFinalService } from './services/common/coverage-final.service';
// import {TestExcludeService} from "./services/common/test-exclude.service";

@Module({
  imports: [PrismaModule],
  controllers: [CoverageController],
  providers: [
    // CoverageResolver,
    // GetCoveragesService,
    CoverageClientService,
    CoverageFinalService,
    // CoveragediskService,
    // ConsumerCoverageService,
    // CoveragePreStoreService,
    // CoverageFinalService,
    // TestExcludeService
  ],
})
export class CoverageModule {
}
